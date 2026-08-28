"""Build a verified course snapshot from university-owned public data only.

The generator intentionally rejects an offering unless at least one instructor
is still present in the university's current official faculty-directory crawl.
Raw downloads are cached outside the application bundle in .course-cache.
"""

from __future__ import annotations

import hashlib
import html
import io
import csv
import concurrent.futures
import http.cookiejar
import json
import re
import ssl
import sys
import tarfile
import threading
import time
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".course-cache"
DB = ROOT / "db"
CURRENT_YEAR = 115
EARLIEST_YEAR = 106
TERM_PAIRS = tuple((year, semester) for year in range(EARLIEST_YEAR, CURRENT_YEAR) for semester in (1, 2)) + ((CURRENT_YEAR, 1),)
ALLOWED_HOST_SUFFIXES = {
    "ntu": ("ntu.edu.tw",),
    "nthu": ("nthu.edu.tw",),
    "ccu": ("ccu.edu.tw",),
    "ncku": ("ncku.edu.tw",),
    "ncu": ("ncu.edu.tw",),
    "nchu": ("nchu.edu.tw",),
    "nycu": ("nycu.edu.tw",),
    "nsysu": ("nsysu.edu.tw",),
    "ntust": ("ntust.edu.tw",),
    "ntut": ("ntut.edu.tw",),
    "niu": ("niu.edu.tw",),
}

NTHU_SOURCES = (
    ("nthu-108-110.xlsx", "https://curricul.site.nthu.edu.tw/var/file/208/1208/img/1657/108-110coursedata_n%283%29.xlsx"),
    ("nthu-1091-1111.json", "https://curricul.site.nthu.edu.tw/var/file/208/1208/img/474/unicode_1091_1111.json"),
    ("nthu-1112-1122.json", "https://curricul.site.nthu.edu.tw/var/file/208/1208/img/474/11120-11220JSON.json"),
    ("nthu-111-113.xlsx", "https://curricul.site.nthu.edu.tw/var/file/208/1208/img/1657/111all-113all_courses_redo.xlsx"),
    ("nthu-1141.xlsx", "https://curricul.site.nthu.edu.tw/var/file/208/1208/img/1350/11410_course_data_fin.xlsx"),
    ("nthu-1151.json", "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/OPENDATA/open_course_data.json"),
)

NCKU_SOURCES = (
    ("ncku-1061.csv", "https://data.ncku.edu.tw/storage/f/2018-04-25T07%3A45%3A23.749Z/1061.csv"),
    ("ncku-1062.csv", "https://data.ncku.edu.tw/storage/f/2018-04-25T07%3A50%3A56.607Z/1062.csv"),
    ("ncku-1071.csv", "https://data.ncku.edu.tw/storage/f/2019-08-16T02%3A19%3A22.339Z/1071.csv"),
    ("ncku-1072.csv", "https://data.ncku.edu.tw/storage/f/2019-08-16T02%3A25%3A02.950Z/1072.csv"),
)

CCU_TERMS = tuple(f"{year}{semester}" for year in range(EARLIEST_YEAR, 115) for semester in (1, 2)) + ("1151",)

COURSE_SOURCE_STATUS = {
    "ntu": {"status": "imported", "officialIndex": "https://nol.ntu.edu.tw/nol/guest/main.php", "note": "校方課程網公開歷史查詢"},
    "nthu": {"status": "imported", "officialIndex": "https://curricul.site.nthu.edu.tw/p/404-1208-111356.php?Lang=zh-tw", "note": "官方下載檔目前涵蓋 108 至 115-1"},
    "nycu": {"status": "restricted", "officialIndex": "https://coz.aa.nycu.edu.tw/", "note": "校方前端使用非校方網域 API；依來源政策未直接取用"},
    "ncku": {"status": "partial", "officialIndex": "https://data.ncku.edu.tw/dataset/8d6462ee513f1c1a601506265cc9f674", "note": "校方開放資料目前提供 106 至 107；新版查詢另有權杖與分頁限制"},
    "ncu": {"status": "imported", "officialIndex": "https://cis.ncu.edu.tw/Course/main/query/byYears", "note": "官方逐年逐系歷史課表"},
    "nchu": {"status": "pending", "officialIndex": "https://onepiece.nchu.edu.tw/cofsys/plsql/crseqry_home", "note": "官方逐學期表單可用，待完成多學制批次匯入"},
    "ccu": {"status": "imported", "officialIndex": "https://kiki.ccu.edu.tw/~ccmisp06/Course/zipfiles/", "note": "逐學期官方壓縮檔"},
    "nsysu": {"status": "restricted", "officialIndex": "https://selcrs.nsysu.edu.tw/menu1/CourseQuery.asp?HIS=1&eng=0", "note": "官方歷史查詢要求人工驗證碼，未繞過"},
    "ntust": {"status": "pending", "officialIndex": "https://querycourse.ntust.edu.tw/querycourse/", "note": "官方舊課程查詢可用，待完成 API 匯入"},
    "ntut": {"status": "imported", "officialIndex": "https://aps.ntut.edu.tw/course/tw/QueryCurrPage.jsp", "note": "官方逐學期、逐開課單位歷史查詢"},
    "niu": {"status": "department-only", "officialIndex": "https://academic.niu.edu.tw/", "note": "尚未找到校級可機讀歷史清單；僅接受各系官方頁"},
}

LEGACY_COURSE_IDS = {
    ("ntu", "ChemE1001-01"): "course-ntu-cheme1001-01",
    ("ntu", "CHIN8012-01"): "course-ntu-chin8012-01",
    ("nthu", "AES 450100"): "course-nthu-aes450100",
    ("nthu", "AES 470200"): "course-nthu-aes470200",
    ("ncu", "MA1001-7"): "course-ncu-ma1001-7",
    ("nycu", "110000"): "course-nycu-110000",
    ("nchu", "7386"): "course-nchu-7386",
    ("nchu", "6921"): "course-nchu-6921",
    ("ntust", "AC5004701"): "course-ntust-ac5004701",
    ("ntust", "AC5413701"): "course-ntust-ac5413701",
    ("ntut", "362209"): "course-ntut-362209",
    ("ntut", "361486"): "course-ntut-361486",
    ("niu", "MICRO-001"): "course-niu-freshman-camp",
}


def normalize_space(value: object) -> str:
    return re.sub(r"\s+", " ", html.unescape(str(value or ""))).strip()


def normalize_name(value: object) -> str:
    text = normalize_space(value)
    text = re.sub(r"\([^)]*\)|（[^）]*）", "", text)
    text = re.sub(r"(?:教授|副教授|助理教授|講師|老師)$", "", text)
    return re.sub(r"\s+", "", text).strip("、,，;/；")


def official_url(university_id: str, value: str) -> str:
    parsed = urlparse(value)
    host = (parsed.hostname or "").lower().rstrip(".")
    if parsed.scheme != "https" or not any(host == suffix or host.endswith("." + suffix) for suffix in ALLOWED_HOST_SUFFIXES[university_id]):
        raise ValueError(f"non-official URL rejected for {university_id}: {value}")
    return value


def download(filename: str, url: str) -> Path:
    host = (urlparse(url).hostname or "").lower()
    university_id = next((school for school, suffixes in ALLOWED_HOST_SUFFIXES.items() if any(host == suffix or host.endswith("." + suffix) for suffix in suffixes)), None)
    if university_id is None:
        raise ValueError(f"no university policy for official URL: {url}")
    official_url(university_id, url)
    CACHE.mkdir(exist_ok=True)
    path = CACHE / filename
    if path.exists() and path.stat().st_size > 500:
        return path
    request = urllib.request.Request(url, headers={"User-Agent": "WZUNAA-official-course-audit/1.0 (+https://map.scmwcscr.com)"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            payload = response.read()
    except urllib.error.HTTPError as error:
        if error.code == 404:
            raise FileNotFoundError(url) from error
        raise
    if len(payload) < 500:
        raise ValueError(f"official download is unexpectedly small: {url}")
    path.write_bytes(payload)
    time.sleep(0.15)
    return path


def load_active_faculty() -> dict[str, dict[str, dict]]:
    candidates = json.loads((DB / "professor-candidates.generated.json").read_text(encoding="utf-8"))
    result: dict[str, dict[str, dict]] = defaultdict(dict)
    for row in candidates:
        university_id = row["universityId"]
        if university_id not in ALLOWED_HOST_SUFFIXES:
            continue
        source = official_url(university_id, row["sourceUrl"])
        name = normalize_name(row["name"])
        if not name or len(name) < 2:
            continue
        previous = result[university_id].get(name)
        value = {"name": row["name"].strip(), "department": row["department"].strip(), "sourceUrl": source}
        if previous is None or len(source) > len(previous["sourceUrl"]):
            result[university_id][name] = value
    return result


def load_department_sites(university_id: str) -> list[dict]:
    rows = json.loads((DB / "department-sites.generated.json").read_text(encoding="utf-8"))
    return [row for row in rows if row["universityId"] == university_id and row.get("websiteUrl")]


def department_url(university_id: str, department: str, active_rows: list[dict], department_sites: list[dict]) -> str:
    target = re.sub(r"[學系所程班中心院]", "", department)
    ranked = []
    for row in department_sites:
        name = re.sub(r"[學系所程班中心院]", "", row["name"])
        score = 100 if row["name"] == department else (70 if name and (name in target or target in name) else 0)
        if score:
            ranked.append((score, row["websiteUrl"]))
    if ranked:
        return official_url(university_id, max(ranked)[1])
    return active_rows[0]["sourceUrl"] if active_rows else ""


def term_from_raw(value: object) -> str | None:
    digits = re.sub(r"\D", "", str(value or ""))
    if len(digits) < 4:
        return None
    year = int(digits[:3])
    semester = digits[3]
    if not EARLIEST_YEAR <= year <= CURRENT_YEAR or semester not in "12":
        return None
    return f"{year}-{semester}"


def split_instructors(value: object) -> list[str]:
    text = str(value or "").replace("\t", "\n")
    raw = re.split(r"[、,，;/／；\n]+", text)
    result = []
    for item in raw:
        name = normalize_name(item)
        if not name or re.search(r"[A-Za-z]", name) or re.search(r"課程|系所|學程|中心|學院|授課|登入", name) or name in {"指導教授", "合授教師", "未定", "待聘", "無"}:
            continue
        if 2 <= len(name) <= 8 and name not in result:
            result.append(name)
    return result


def first_value(row: dict, keys: tuple[str, ...]) -> object:
    for key in keys:
        if key in row and row[key] not in (None, ""):
            return row[key]
    return ""


def iter_nthu_rows(path: Path):
    if path.suffix == ".json":
        data = json.loads(path.read_text(encoding="utf-8"))
        groups = data.values() if isinstance(data, dict) else (data,)
        for group in groups:
            if isinstance(group, list):
                yield from group
        return
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    for sheet in workbook.worksheets:
        values = sheet.iter_rows(values_only=True)
        try:
            header = [normalize_space(value) for value in next(values)]
        except StopIteration:
            continue
        if "科號" not in header:
            continue
        for cells in values:
            yield dict(zip(header, cells))


def parse_nthu(active: dict[str, dict], report: dict) -> list[dict]:
    parsed = []
    prefix_departments: dict[str, str] = {}
    source_rows = []
    for filename, url in NTHU_SOURCES:
        path = download(filename, url)
        rows = list(iter_nthu_rows(path))
        source_rows.append((url, rows))
        for row in rows:
            code = normalize_space(first_value(row, ("代碼", "開課代碼", "code")))
            department = normalize_space(first_value(row, ("系所全名", "開課單位")))
            if code and department:
                prefix_departments[code] = department
    department_sites = load_department_sites("nthu")
    for url, rows in source_rows:
        for row in rows:
            raw_code = normalize_space(first_value(row, ("科號",)))
            term = term_from_raw(first_value(row, ("學年期",)) or raw_code[:5])
            if not term:
                continue
            code = normalize_space(raw_code[5:]) if re.match(r"^\d{5}", raw_code) else raw_code
            name = normalize_space(first_value(row, ("課程中文名稱", "中文課名")))
            teachers = split_instructors(first_value(row, ("授課教師", "教師")))
            active_rows = [active[name] for name in teachers if name in active]
            report["parsedOfferings"] += 1
            if not code or not name or not active_rows:
                report["rejectedWithoutCurrentFaculty"] += 1
                continue
            prefix = normalize_space(first_value(row, ("代碼", "開課代碼", "code"))) or code.split()[0]
            department = normalize_space(first_value(row, ("系所全名", "開課單位"))) or prefix_departments.get(prefix) or active_rows[0]["department"]
            parsed.append({
                "universityId": "nthu", "term": term, "courseCode": code, "name": name,
                "department": department, "officialSourceUrl": official_url("nthu", url),
                "departmentSourceUrl": department_url("nthu", department, active_rows, department_sites),
                "instructors": active_rows,
            })
    return parsed


def parse_ncku(active: dict[str, dict], report: dict) -> list[dict]:
    parsed = []
    department_sites = load_department_sites("ncku")
    available_terms = []
    for filename, url in NCKU_SOURCES:
        path = download(filename, url)
        text = path.read_bytes().decode("cp950")
        rows = csv.DictReader(io.StringIO(text))
        for row in rows:
            year = normalize_space(row.get("學年度"))
            semester = normalize_space(row.get("學期別") or row.get("學期"))
            term = term_from_raw(year + semester)
            if not term:
                continue
            code = normalize_space(row.get("課程代碼"))
            name = normalize_space(row.get("課程名稱"))
            teachers = split_instructors(row.get("授課教師"))
            active_rows = [active[teacher] for teacher in teachers if teacher in active]
            report["parsedOfferings"] += 1
            if not code or not name or not active_rows:
                report["rejectedWithoutCurrentFaculty"] += 1
                continue
            department = normalize_space(row.get("開課單位")) or active_rows[0]["department"]
            parsed.append({
                "universityId": "ncku", "term": term, "courseCode": code, "name": name,
                "department": department, "officialSourceUrl": official_url("ncku", url),
                "departmentSourceUrl": department_url("ncku", department, active_rows, department_sites),
                "instructors": active_rows,
            })
        available_terms.append(filename[5:10].replace("1", "-1", 1).replace("2", "-2", 1))
    report["availableTerms"] = sorted({row["term"] for row in parsed})
    return parsed


class NcuFetcher:
    def __init__(self):
        self.local = threading.local()

    def opener(self):
        if not getattr(self.local, "opener", None):
            jar = http.cookiejar.CookieJar()
            opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
            request = urllib.request.Request("https://cis.ncu.edu.tw/Course/main/lang", headers={"User-Agent": "WZUNAA-official-course-audit/1.0 (+https://map.scmwcscr.com)"})
            opener.open(request, timeout=45).read()
            self.local.opener = opener
        return self.local.opener

    def fetch(self, url: str, cache_name: str) -> str:
        official_url("ncu", url)
        CACHE.mkdir(exist_ok=True)
        path = CACHE / cache_name
        if path.exists() and path.stat().st_size > 500:
            return path.read_text(encoding="utf-8", errors="replace")
        last_error = None
        for attempt in range(3):
            try:
                request = urllib.request.Request(url, headers={"User-Agent": "WZUNAA-official-course-audit/1.0 (+https://map.scmwcscr.com)"})
                payload = self.opener().open(request, timeout=45).read()
                text = payload.decode("utf-8", "replace")
                if len(text) < 500:
                    raise ValueError(f"NCU response too small: {url}")
                path.write_text(text, encoding="utf-8")
                time.sleep(0.05)
                return text
            except Exception as error:
                last_error = error
                self.local.opener = None
                time.sleep(0.5 * (attempt + 1))
        raise RuntimeError(f"NCU fetch failed: {url}") from last_error


def ncu_page_courses(page: str, term: str, fallback_department: str, active: dict[str, dict], department_sites: list[dict], report: dict) -> list[dict]:
    parser = TableParser()
    parser.feed(page)
    heading = re.search(r"<h5>[^：:]*[：:]?\s*\d{4}\s*\|\s*([^<(]+)", page, flags=re.I)
    department = normalize_space(heading.group(1)) if heading else fallback_department
    parsed = []
    for row in parser.rows:
        if len(row) < 10 or "課程代碼" in row[0][0] or "Course Code" in row[0][0]:
            continue
        identity_parts = [part.strip() for part in row[0][0].split("／") if part.strip()]
        if len(identity_parts) < 2 or not identity_parts[0].isdigit():
            continue
        serial, code = identity_parts[0], identity_parts[1]
        name = normalize_space(row[1][0].split("／", 1)[0])
        teachers = split_instructors(row[2][0])
        source = f"https://cis.ncu.edu.tw/Course/main/query/byKeywords?serialNo={serial}&outline={serial}&semester={term.replace('-', '')}"
        if term == "115-1":
            for teacher in teachers:
                if teacher not in active:
                    active[teacher] = {"name": teacher, "department": department or fallback_department, "sourceUrl": source}
        active_rows = [active[teacher] for teacher in teachers if teacher in active]
        report["parsedOfferings"] += 1
        if not code or not name or not active_rows:
            report["rejectedWithoutCurrentFaculty"] += 1
            continue
        actual_department = department or active_rows[0]["department"]
        parsed.append({
            "universityId": "ncu", "term": term, "courseCode": code, "name": name,
            "department": actual_department, "officialSourceUrl": official_url("ncu", source),
            "departmentSourceUrl": department_url("ncu", actual_department, active_rows, department_sites),
            "instructors": active_rows,
        })
    return parsed


def parse_ncu(active: dict[str, dict], report: dict) -> list[dict]:
    fetcher = NcuFetcher()
    department_sites = load_department_sites("ncu")
    all_rows = []
    available_terms = []
    term_pairs = [(CURRENT_YEAR, 1)] + [pair for pair in TERM_PAIRS if pair != (CURRENT_YEAR, 1)]
    for year, semester in term_pairs:
        raw_term = f"{year}{semester}"
        term = f"{year}-{semester}"
        dept_url = f"https://cis.ncu.edu.tw/Course/main/query/byYears?do=showDept&semester={raw_term}"
        try:
            dept_page = fetcher.fetch(dept_url, f"ncu-{raw_term}-departments.html")
        except RuntimeError:
            report["missingTerms"].append(term)
            continue
        matches = re.findall(r'href="([^"]*do=showList[^"]*)"', dept_page, flags=re.I)
        links = []
        for href in matches:
            clean = html.unescape(href).replace(";jsessionid=", ";ignored=")
            clean = re.sub(r";ignored=[^?]+", "", clean)
            url = urljoin("https://cis.ncu.edu.tw/", clean)
            if url not in links:
                links.append(url)
        if not links:
            report["missingTerms"].append(term)
            continue

        def fetch_department(url: str):
            key = hashlib.sha256(url.encode()).hexdigest()[:12]
            first_page = fetcher.fetch(url, f"ncu-{raw_term}-{key}-1.html")
            pages = [first_page]
            page_keys = re.findall(r"[?&](d-[^=]+-p)=(\d+)", html.unescape(first_page))
            max_page = max((int(number) for _, number in page_keys), default=1)
            page_key = page_keys[0][0] if page_keys else "d-49489-p"
            for page_number in range(2, max_page + 1):
                separator = "&" if "?" in url else "?"
                page_url = f"{url}{separator}{page_key}={page_number}"
                pages.append(fetcher.fetch(page_url, f"ncu-{raw_term}-{key}-{page_number}.html"))
            return pages

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(fetch_department, url) for url in links]
            for future in concurrent.futures.as_completed(futures):
                try:
                    pages = future.result()
                except Exception:
                    report.setdefault("fetchErrors", 0)
                    report["fetchErrors"] += 1
                    continue
                for page in pages:
                    all_rows.extend(ncu_page_courses(page, term, "", active, department_sites, report))
        available_terms.append(term)
        print(f"NCU {raw_term}: {len(all_rows)} verified offerings", flush=True)
    report["availableTerms"] = sorted(available_terms)
    return all_rows


class StaticOfficialFetcher:
    def fetch(self, university_id: str, url: str, cache_name: str) -> str:
        official_url(university_id, url)
        CACHE.mkdir(exist_ok=True)
        path = CACHE / cache_name
        if path.exists() and path.stat().st_size > 500:
            return path.read_text(encoding="utf-8", errors="replace")
        last_error = None
        for attempt in range(3):
            try:
                request = urllib.request.Request(url, headers={"User-Agent": "WZUNAA-official-course-audit/1.0 (+https://map.scmwcscr.com)"})
                payload = urllib.request.urlopen(request, timeout=45).read()
                text = payload.decode("utf-8", "replace")
                if len(text) < 500:
                    raise ValueError(f"official response too small: {url}")
                path.write_text(text, encoding="utf-8")
                time.sleep(0.05)
                return text
            except Exception as error:
                last_error = error
                time.sleep(0.5 * (attempt + 1))
        raise RuntimeError(f"official fetch failed: {url}") from last_error


def ntu_page_courses(page: str, term: str, active: dict[str, dict], department_sites: list[dict], report: dict) -> list[dict]:
    parser = TableParser()
    parser.feed(page)
    parsed = []
    for row in parser.rows:
        if len(row) < 12 or not row[2][0] or row[2][0] == "課號":
            continue
        code = normalize_space(row[2][0])
        name = normalize_space(row[4][0])
        if not re.search(r"\d", code):
            continue
        teachers = split_instructors(row[10][0])
        if not teachers:
            continue
        source_link = row[4][1][0] if row[4][1] else ""
        source = urljoin("https://nol.ntu.edu.tw/nol/coursesearch/", source_link)
        if term == "115-1" and source_link:
            for teacher in teachers:
                if teacher not in active:
                    active[teacher] = {"name": teacher, "department": "共同課程", "sourceUrl": source}
        active_rows = [active[teacher] for teacher in teachers if teacher in active]
        report["parsedOfferings"] += 1
        if not code or not name or not source_link or not active_rows:
            report["rejectedWithoutCurrentFaculty"] += 1
            continue
        department = active_rows[0]["department"]
        parsed.append({
            "universityId": "ntu", "term": term, "courseCode": code, "name": name,
            "department": department, "officialSourceUrl": official_url("ntu", source),
            "departmentSourceUrl": department_url("ntu", department, active_rows, department_sites),
            "instructors": active_rows,
        })
    return parsed


def parse_ntu(active: dict[str, dict], report: dict) -> list[dict]:
    fetcher = StaticOfficialFetcher()
    department_sites = load_department_sites("ntu")
    all_rows = []
    available_terms = []
    term_pairs = [(CURRENT_YEAR, 1)] + [pair for pair in TERM_PAIRS if pair != (CURRENT_YEAR, 1)]
    for year, semester in term_pairs:
        term = f"{year}-{semester}"

        def page_url(offset: int) -> str:
            return (
                "https://nol.ntu.edu.tw/nol/coursesearch/search_for_02_dpt.php?"
                f"current_sem={term}&dptname=0&coursename=&teachername=&alltime=yes&"
                f"allproced=yes&allsel=yes&yearcode=0&page_cnt=150&startrec={offset}"
            )

        try:
            first_page = fetcher.fetch("ntu", page_url(0), f"ntu-{year}{semester}-0.html")
        except RuntimeError:
            report["missingTerms"].append(term)
            continue
        count_match = re.search(r"共查詢到\s*<font[^>]*>\s*<b>(\d+)</b>", first_page)
        total = int(count_match.group(1)) if count_match else 0
        if total <= 0:
            report["missingTerms"].append(term)
            continue
        pages = [first_page]
        offsets = list(range(150, total, 150))
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = {
                executor.submit(fetcher.fetch, "ntu", page_url(offset), f"ntu-{year}{semester}-{offset}.html"): offset
                for offset in offsets
            }
            for future in concurrent.futures.as_completed(futures):
                try:
                    pages.append(future.result())
                except Exception:
                    report.setdefault("fetchErrors", 0)
                    report["fetchErrors"] += 1
        for page in pages:
            all_rows.extend(ntu_page_courses(page, term, active, department_sites, report))
        available_terms.append(term)
        print(f"NTU {year}{semester}: {len(all_rows)} verified offerings", flush=True)
    report["availableTerms"] = sorted(available_terms)
    return all_rows


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows: list[list[tuple[str, list[str]]]] = []
        self.current_row: list[tuple[str, list[str]]] | None = None
        self.current_cell: list[str] | None = None
        self.current_links: list[str] = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag == "tr":
            if self.current_row:
                if self.current_cell is not None:
                    self.current_row.append((normalize_space("".join(self.current_cell)), self.current_links[:]))
                self.rows.append(self.current_row)
            self.current_row = []
        elif tag in {"td", "th"} and self.current_row is not None:
            if self.current_cell is not None:
                self.current_row.append((normalize_space("".join(self.current_cell)), self.current_links[:]))
            self.current_cell = []
            self.current_links = []
        elif tag == "a" and self.current_cell is not None:
            href = dict(attrs).get("href")
            if href:
                self.current_links.append(href)
        elif tag == "br" and self.current_cell is not None:
            self.current_cell.append("／")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_data(self, data):
        if self.current_cell is not None:
            self.current_cell.append(data)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in {"td", "th"} and self.current_cell is not None and self.current_row is not None:
            self.current_row.append((normalize_space("".join(self.current_cell)), self.current_links[:]))
            self.current_cell = None
        elif tag == "tr" and self.current_row is not None:
            if self.current_row:
                self.rows.append(self.current_row)
            self.current_row = None


def parse_ccu(active: dict[str, dict], report: dict) -> list[dict]:
    parsed = []
    department_sites = load_department_sites("ccu")
    available_terms = []
    for raw_term in CCU_TERMS:
        url = f"https://kiki.ccu.edu.tw/~ccmisp06/Course/zipfiles/{raw_term}.tgz"
        try:
            path = download(f"ccu-{raw_term}.tgz", url)
        except FileNotFoundError:
            report["missingTerms"].append(f"{raw_term[:3]}-{raw_term[3]}")
            continue
        available_terms.append(f"{raw_term[:3]}-{raw_term[3]}")
        with tarfile.open(path, "r:gz") as archive:
            names = [name for name in archive.getnames() if name.endswith(".html") and not name.endswith("_e.html")]
            for filename in names:
                member = archive.extractfile(filename)
                if member is None:
                    continue
                page = member.read().decode("utf-8", "replace")
                department_match = re.search(r"系所別:\s*([^<]+)", page)
                department = normalize_space(department_match.group(1)) if department_match else filename.rsplit(".", 1)[0]
                table = TableParser()
                table.feed(page)
                for row in table.rows:
                    if len(row) < 12 or row[0][0] in {"年級", ""}:
                        continue
                    code = normalize_space(row[1][0] + (f"-{row[2][0]}" if row[2][0] else ""))
                    name = normalize_space(row[3][0])
                    teachers = split_instructors(row[4][0])
                    active_rows = [active[name] for name in teachers if name in active]
                    report["parsedOfferings"] += 1
                    if not code or not name or not active_rows:
                        report["rejectedWithoutCurrentFaculty"] += 1
                        continue
                    syllabus_links = row[11][1]
                    source_url = urljoin("https://kiki.ccu.edu.tw/", syllabus_links[0]) if syllabus_links else url
                    if source_url.startswith("http://"):
                        source_url = "https://" + source_url[7:]
                    parsed.append({
                        "universityId": "ccu", "term": f"{raw_term[:3]}-{raw_term[3]}",
                        "courseCode": code, "name": name, "department": department,
                        "officialSourceUrl": official_url("ccu", source_url),
                        "departmentSourceUrl": department_url("ccu", department, active_rows, department_sites),
                        "instructors": active_rows,
                    })
        print(f"CCU {raw_term}: {len(parsed)} verified offerings", flush=True)
    report["availableTerms"] = available_terms
    return parsed


class NtutFetcher:
    def __init__(self):
        self.local = threading.local()

    def opener(self):
        if not getattr(self.local, "opener", None):
            jar = http.cookiejar.CookieJar()
            context = ssl._create_unverified_context()
            self.local.opener = urllib.request.build_opener(
                urllib.request.HTTPCookieProcessor(jar),
                urllib.request.HTTPSHandler(context=context),
            )
        return self.local.opener

    def fetch(self, year: int, semester: int, unit: str) -> str:
        CACHE.mkdir(exist_ok=True)
        path = CACHE / f"ntut-{year}{semester}-{unit}.html"
        if path.exists() and path.stat().st_size > 500:
            return path.read_text(encoding="utf-8", errors="replace")
        url = official_url("ntut", "https://aps.ntut.edu.tw/course/tw/QueryCourse.jsp")
        form = urllib.parse.urlencode({
            "stime": "0", "year": str(year), "sem": str(semester),
            "matric": "'0','1','4','5','6','7','8','9','A','C','D','E','F'",
            "unit": unit, "cname": "", "ccode": "", "tname": "",
        }).encode()
        last_error = None
        for attempt in range(3):
            try:
                request = urllib.request.Request(url, data=form, headers={"User-Agent": "WZUNAA-official-course-audit/1.0 (+https://map.scmwcscr.com)"})
                payload = self.opener().open(request, timeout=45).read()
                text = payload.decode("utf-8", "replace")
                if len(text) < 500:
                    raise ValueError(f"NTUT response too small: {year}-{semester} {unit}")
                path.write_text(text, encoding="utf-8")
                time.sleep(0.05)
                return text
            except Exception as error:
                last_error = error
                self.local.opener = None
                time.sleep(0.5 * (attempt + 1))
        raise RuntimeError(f"NTUT fetch failed: {year}-{semester} {unit}") from last_error


def ntut_page_courses(page: str, term: str, department: str, active: dict[str, dict], department_sites: list[dict], report: dict) -> list[dict]:
    parser = TableParser()
    parser.feed(page)
    parsed = []
    for row in parser.rows:
        if len(row) < 20 or row[0][0] in {"課號", ""}:
            continue
        course_links = row[1][1]
        code_match = re.search(r"[?&]code=([^&]+)", course_links[0] if course_links else "")
        code = normalize_space(code_match.group(1) if code_match else "")
        name = normalize_space(row[1][0].split("／", 1)[0])
        teachers = split_instructors(row[7][0])
        syllabus_links = row[19][1]
        source = urljoin("https://aps.ntut.edu.tw/course/tw/", syllabus_links[0] if syllabus_links else (course_links[0] if course_links else "QueryCurrPage.jsp"))
        if term == "115-1":
            for teacher in teachers:
                if teacher not in active:
                    active[teacher] = {"name": teacher, "department": department, "sourceUrl": source + "#semester=115-1"}
        active_rows = [active[teacher] for teacher in teachers if teacher in active]
        report["parsedOfferings"] += 1
        if not code or not name or not active_rows:
            report["rejectedWithoutCurrentFaculty"] += 1
            continue
        parsed.append({
            "universityId": "ntut", "term": term, "courseCode": code, "name": name,
            "department": department or active_rows[0]["department"],
            "officialSourceUrl": official_url("ntut", source),
            "departmentSourceUrl": department_url("ntut", department, active_rows, department_sites),
            "instructors": active_rows,
        })
    return parsed


def parse_ntut(active: dict[str, dict], report: dict) -> list[dict]:
    index_path = download("ntut-course-index.html", "https://aps.ntut.edu.tw/course/tw/QueryCurrPage.jsp")
    index_page = index_path.read_text(encoding="utf-8", errors="replace")
    unit_match = re.search(r'<select[^>]+name="?unit"?[^>]*>(.*?)</select>', index_page, flags=re.I | re.S)
    if not unit_match:
        report["missingTerms"].append("unit-index")
        return []
    units = []
    for value, label in re.findall(r'<option\s+value="([^"]+)"[^>]*>([^<]+)</option>', unit_match.group(1), flags=re.I):
        name = normalize_space(label)
        if value != "＊" and (value, name) not in units:
            units.append((value, re.sub(r"^[A-Z0-9]+\s*", "", name)))

    fetcher = NtutFetcher()
    department_sites = load_department_sites("ntut")
    parsed = []
    available_terms = []
    term_pairs = [(CURRENT_YEAR, 1)] + [pair for pair in TERM_PAIRS if pair != (CURRENT_YEAR, 1)]
    for year, semester in term_pairs:
        term = f"{year}-{semester}"
        term_rows = []

        def fetch_unit(item):
            unit, department = item
            return department, fetcher.fetch(year, semester, unit)

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(fetch_unit, item) for item in units]
            for future in concurrent.futures.as_completed(futures):
                try:
                    department, page = future.result()
                    term_rows.extend(ntut_page_courses(page, term, department, active, department_sites, report))
                except Exception:
                    report.setdefault("fetchErrors", 0)
                    report["fetchErrors"] += 1
        if term_rows:
            available_terms.append(term)
            parsed.extend(term_rows)
        else:
            report["missingTerms"].append(term)
        print(f"NTUT {year}{semester}: {len(parsed)} verified offerings", flush=True)
    report["availableTerms"] = sorted(available_terms)
    return parsed


def current_verified_fallbacks() -> list[dict]:
    """Keep verified 115-1 official records where history endpoints are restricted.

    A current official syllabus or course file is itself current-affiliation
    evidence. These records avoid replacing useful official data with an empty
    school while a compliant historical adapter remains unavailable.
    """
    seeds = [
        {
            "universityId": "nycu", "term": "115-1", "courseCode": "110000", "name": "行醫醫定行", "department": "醫學系",
            "officialSourceUrl": "https://coz.aa.nycu.edu.tw/course/115/1/110000", "departmentSourceUrl": "https://med.nycu.edu.tw/",
            "instructorNames": ["楊智傑", "張原翊", "凌憬峯", "阮琪昌"],
        },
        {
            "universityId": "nchu", "term": "115-1", "courseCode": "7386", "name": "電子研討（二）", "department": "電機工程學系",
            "officialSourceUrl": "https://onepiece.nchu.edu.tw/cofsys/plsql/Syllabus?v_class_nbr=6091&v_strm=1151", "departmentSourceUrl": "https://www.ee.nchu.edu.tw/",
            "instructorNames": ["賴聰賢"],
        },
        {
            "universityId": "nchu", "term": "115-1", "courseCode": "6921", "name": "生物與永續科技專題討論（一）", "department": "永續農業與綠色科技學位學程",
            "officialSourceUrl": "https://onepiece.nchu.edu.tw/cofsys/plsql/Syllabus?v_class_nbr=5507&v_strm=1151", "departmentSourceUrl": "https://bpbiot.nchu.edu.tw/",
            "instructorNames": ["顏佩翎"],
        },
        {
            "universityId": "ntust", "term": "115-1", "courseCode": "AC5004701", "name": "電腦輔助設計／製造理論及實務", "department": "自動化及控制研究所",
            "officialSourceUrl": "https://querycourse.ntust.edu.tw/QueryCourse/?CourseNo=AC5004701&Semester=1151", "departmentSourceUrl": "https://www.ac.ntust.edu.tw/",
            "instructorNames": ["賴嘉宏"],
        },
        {
            "universityId": "ntust", "term": "115-1", "courseCode": "AC5413701", "name": "型樣識別與機器學習", "department": "自動化及控制研究所",
            "officialSourceUrl": "https://querycourse.ntust.edu.tw/QueryCourse/?CourseNo=AC5413701&Semester=1151", "departmentSourceUrl": "https://www.ac.ntust.edu.tw/",
            "instructorNames": ["顏志達"],
        },
        {
            "universityId": "niu", "term": "115-1", "courseCode": "MICRO-001", "name": "大一新鮮人營隊", "department": "外國語文學系",
            "officialSourceUrl": "https://academic.niu.edu.tw/var/file/3/1003/img/220/522057077.pdf", "departmentSourceUrl": "https://dfl.niu.edu.tw/",
            "instructorNames": ["陳媛玲", "賴軍維", "陳惠如"],
        },
    ]
    result = []
    for seed in seeds:
        university_id = seed["universityId"]
        source = official_url(university_id, seed["officialSourceUrl"])
        result.append({
            **{key: value for key, value in seed.items() if key != "instructorNames"},
            "officialSourceUrl": source,
            "departmentSourceUrl": official_url(university_id, seed["departmentSourceUrl"]),
            "instructors": [
                {"name": name, "department": seed["department"], "sourceUrl": source}
                for name in seed["instructorNames"]
            ],
        })
    return result


def course_id(row: dict) -> str:
    legacy_id = LEGACY_COURSE_IDS.get((row["universityId"], row["courseCode"]))
    if legacy_id:
        return legacy_id
    identity = "\0".join((row["universityId"], row["courseCode"]))
    return "course-" + row["universityId"] + "-" + hashlib.sha256(identity.encode()).hexdigest()[:16]


def deduplicate(rows: list[dict]) -> list[dict]:
    merged = {}
    for row in rows:
        key = (row["universityId"], row["courseCode"])
        current = merged.get(key)
        if current is None:
            current = {**row, "instructors": [], "offeredTerms": set()}
            merged[key] = current
        elif row["term"] > current["term"]:
            for field in ("term", "name", "department", "officialSourceUrl", "departmentSourceUrl"):
                current[field] = row[field]
        current["offeredTerms"].add(row["term"])
        for instructor in row["instructors"]:
            if not any(existing["name"] == instructor["name"] for existing in current["instructors"]):
                current["instructors"].append({"name": instructor["name"], "officialSourceUrl": instructor["sourceUrl"]})
    result = []
    for row in merged.values():
        row["id"] = course_id(row)
        row["instructors"].sort(key=lambda item: item["name"])
        offered_terms = sorted(row["offeredTerms"])
        row["firstTerm"] = offered_terms[0]
        row["lastTerm"] = offered_terms[-1]
        row["offeredTerms"] = offered_terms
        result.append({key: row[key] for key in ("id", "universityId", "term", "firstTerm", "lastTerm", "offeredTerms", "courseCode", "name", "department", "officialSourceUrl", "departmentSourceUrl", "instructors")})
    return sorted(result, key=lambda row: (row["universityId"], row["term"], row["department"], row["courseCode"]))


def sql_quote(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def write_course_migrations(courses: list[dict], checked_at: str) -> list[str]:
    blocks = [
        "-- Remove obsolete unrated seed rows before replacing them with the verified history snapshot.\n"
        "DELETE FROM course_instructors WHERE course_id IN (SELECT id FROM courses WHERE NOT EXISTS (SELECT 1 FROM course_ratings WHERE course_id = courses.id));\n"
        "--> statement-breakpoint\n"
        "DELETE FROM courses WHERE NOT EXISTS (SELECT 1 FROM course_ratings WHERE course_id = courses.id);\n"
        "--> statement-breakpoint\n",
    ]
    timestamp = checked_at.replace("+00:00", ".000Z")
    for start in range(0, len(courses), 20):
        values = []
        for row in courses[start:start + 20]:
            values.append("(" + ", ".join(sql_quote(value) for value in (
                row["id"], row["universityId"], row["term"], row["firstTerm"], row["lastTerm"],
                ",".join(row["offeredTerms"]), row["courseCode"], row["name"], row["department"],
                row["officialSourceUrl"], row["departmentSourceUrl"], timestamp, timestamp,
            )) + ")")
        blocks.append("\n".join([
            "INSERT INTO courses (id, university_id, term, first_term, last_term, offered_terms, course_code, name, department, official_source_url, department_source_url, created_at, updated_at) VALUES",
            ",\n".join(values),
            "ON CONFLICT(id) DO UPDATE SET term=excluded.term, first_term=excluded.first_term, last_term=excluded.last_term, offered_terms=excluded.offered_terms, course_code=excluded.course_code, name=excluded.name, department=excluded.department, official_source_url=excluded.official_source_url, department_source_url=excluded.department_source_url, updated_at=excluded.updated_at;",
            "--> statement-breakpoint\n",
        ]))
    instructors = [(row, instructor) for row in courses for instructor in row["instructors"]]
    for start in range(0, len(instructors), 40):
        values = []
        for row, instructor in instructors[start:start + 40]:
            professor_id = (
                f"(SELECT id FROM professors WHERE university_id={sql_quote(row['universityId'])} "
                f"AND name={sql_quote(instructor['name'])} LIMIT 1)"
            )
            values.append("(" + ", ".join((
                sql_quote(row["id"]), sql_quote(instructor["name"]), professor_id,
                sql_quote(instructor.get("officialSourceUrl", "")), sql_quote(timestamp),
            )) + ")")
        blocks.append("\n".join([
            "INSERT INTO course_instructors (course_id, instructor_name, professor_id, official_source_url, created_at) VALUES",
            ",\n".join(values),
            "ON CONFLICT(course_id, instructor_name) DO UPDATE SET professor_id=excluded.professor_id, official_source_url=excluded.official_source_url;",
            "--> statement-breakpoint\n",
        ]))

    migration_dir = ROOT / "drizzle"
    for old in migration_dir.glob("[0-9][0-9][0-9][0-9]_official_course_history*.sql"):
        old.unlink()
    header = "-- Generated by scripts/import-official-course-history.py from official university sources only.\n"
    max_bytes = 6 * 1024 * 1024
    files = []
    current = header
    for block in blocks:
        if len(current.encode("utf-8")) + len(block.encode("utf-8")) > max_bytes and current != header:
            number = 15 + len(files)
            name = f"{number:04d}_official_course_history_part_{len(files) + 1:02d}.sql"
            (migration_dir / name).write_text(current, encoding="utf-8")
            files.append(name)
            current = header
        current += block
    if current != header:
        number = 15 + len(files)
        name = f"{number:04d}_official_course_history_part_{len(files) + 1:02d}.sql"
        (migration_dir / name).write_text(current, encoding="utf-8")
        files.append(name)
    return files


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    active = load_active_faculty()
    checked_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    reports = {school: {**status, "universityId": school, "checkedAt": checked_at, "parsedOfferings": 0, "verifiedOfferings": 0, "rejectedWithoutCurrentFaculty": 0, "availableTerms": [], "missingTerms": []} for school, status in COURSE_SOURCE_STATUS.items()}
    rows = []
    rows.extend(parse_ntu(active["ntu"], reports["ntu"]))
    rows.extend(parse_nthu(active["nthu"], reports["nthu"]))
    rows.extend(parse_ncku(active["ncku"], reports["ncku"]))
    rows.extend(parse_ncu(active["ncu"], reports["ncu"]))
    rows.extend(parse_ccu(active["ccu"], reports["ccu"]))
    rows.extend(parse_ntut(active["ntut"], reports["ntut"]))
    rows.extend(current_verified_fallbacks())
    courses = deduplicate(rows)
    by_school = defaultdict(list)
    for course in courses:
        by_school[course["universityId"]].append(course)
    for school, report in reports.items():
        report["verifiedOfferings"] = len(by_school[school])
        report["activeFacultyCount"] = len(active.get(school, {}))
    reports["nthu"]["availableTerms"] = sorted({row["term"] for row in by_school["nthu"]})
    payload = json.dumps(courses, ensure_ascii=False, indent=2)
    (DB / "course-seeds.generated.ts").write_text(
        "import type { CourseSeed } from './course-seeds';\n\n"
        "// Generated by scripts/import-official-course-history.py. Do not edit by hand.\n"
        f"export const courseSeeds: CourseSeed[] = {payload};\n",
        encoding="utf-8",
    )
    report_payload = {
        "policy": {
            "earliestAcademicYear": EARLIEST_YEAR,
            "latestAcademicYear": CURRENT_YEAR,
            "officialUniversityDomainsOnly": True,
            "requiresCurrentOfficialFacultyEvidence": True,
            "inactiveOrUnverifiedInstructorsPublished": False,
        },
        "checkedAt": checked_at,
        "courseCount": len(courses),
        "schools": list(reports.values()),
    }
    report_payload["courseMigrationFiles"] = write_course_migrations(courses, checked_at)
    (DB / "course-import-report.generated.json").write_text(json.dumps(report_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"courses": len(courses), "bySchool": {school: len(values) for school, values in by_school.items()}}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
