export type CourseSeed = {
  id: string;
  universityId: string;
  term: string;
  courseCode: string;
  name: string;
  department: string;
  officialSourceUrl: string;
  departmentSourceUrl: string;
  instructors: Array<{ name: string; officialSourceUrl?: string }>;
};

// 115-1 official public catalog snapshot. Every row points to a university-owned
// course, syllabus, or academic page; no forum or commercial directory is used.
export const courseSeeds: CourseSeed[] = [
  {
    id: 'course-ntu-cheme1001-01', universityId: 'ntu', term: '115-1', courseCode: 'ChemE1001-01',
    name: '服務學習一', department: '化學工程學系',
    officialSourceUrl: 'https://nol.ntu.edu.tw/nol/coursesearch/search_for_02_dpt.php?current_sem=115-1&dptname=5040&coursename=&teachername=&alltime=yes&allproced=yes&allsel=yes&yearcode=0&page_cnt=150',
    departmentSourceUrl: 'https://www.che.ntu.edu.tw/', instructors: [{ name: '吳紀聖' }],
  },
  {
    id: 'course-ntu-chin8012-01', universityId: 'ntu', term: '115-1', courseCode: 'CHIN8012-01',
    name: '大學國文：文學鑑賞與寫作（一）', department: '共同教育中心',
    officialSourceUrl: 'https://nol.ntu.edu.tw/nol/coursesearch/search_for_01_major.php',
    departmentSourceUrl: 'https://cge.ntu.edu.tw/', instructors: [{ name: '林宏佳' }],
  },
  {
    id: 'course-nthu-aes450100', universityId: 'nthu', term: '115-1', courseCode: 'AES 450100',
    name: '環境微生物學', department: '分析與環境科學研究所',
    officialSourceUrl: 'https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/OPENDATA/open_course_data.json',
    departmentSourceUrl: 'https://aes.site.nthu.edu.tw/', instructors: [{ name: '李清福' }],
  },
  {
    id: 'course-nthu-aes470200', universityId: 'nthu', term: '115-1', courseCode: 'AES 470200',
    name: '永續環境治理的設計思考', department: '分析與環境科學研究所',
    officialSourceUrl: 'https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/OPENDATA/open_course_data.json',
    departmentSourceUrl: 'https://aes.site.nthu.edu.tw/', instructors: [{ name: '陳俊銘' }, { name: '周秀娟' }],
  },
  {
    id: 'course-nycu-110000', universityId: 'nycu', term: '115-1', courseCode: '110000',
    name: '行醫醫定行', department: '醫學系', officialSourceUrl: 'https://coz.aa.nycu.edu.tw/course/115/1/110000',
    departmentSourceUrl: 'https://med.nycu.edu.tw/', instructors: [{ name: '楊智傑' }, { name: '張原翊' }, { name: '凌憬峯' }, { name: '阮琪昌' }],
  },
  {
    id: 'course-nycu-110001', universityId: 'nycu', term: '115-1', courseCode: '110001',
    name: '心靈成長（一）', department: '醫學系', officialSourceUrl: 'https://coz.aa.nycu.edu.tw/course/115/1/110001',
    departmentSourceUrl: 'https://med.nycu.edu.tw/', instructors: [{ name: '醫學系' }],
  },
  {
    id: 'course-ncku-current-course', universityId: 'ncku', term: '115-1', courseCode: '1151-CURRENT',
    name: '115-1 課程全覽', department: '各開課單位', officialSourceUrl: 'https://course-query.acad.ncku.edu.tw/index.php?c=qry11225',
    departmentSourceUrl: 'https://course.ncku.edu.tw/', instructors: [{ name: '各課程授課教師' }],
  },
  {
    id: 'course-ncu-ma1001-7', universityId: 'ncu', term: '115-1', courseCode: 'MA1001-7',
    name: '微積分', department: '數學系', officialSourceUrl: 'https://cis.ncu.edu.tw/ApcourseSys/search/searchCrs/pdf/340',
    departmentSourceUrl: 'https://math.ncu.edu.tw/', instructors: [{ name: '饒維明' }],
  },
  {
    id: 'course-nchu-7386', universityId: 'nchu', term: '115-1', courseCode: '7386',
    name: '電子研討（二）', department: '電機工程學系', officialSourceUrl: 'https://onepiece.nchu.edu.tw/cofsys/plsql/Syllabus?v_class_nbr=6091&v_strm=1151',
    departmentSourceUrl: 'https://www.ee.nchu.edu.tw/', instructors: [{ name: '賴聰賢' }],
  },
  {
    id: 'course-nchu-6921', universityId: 'nchu', term: '115-1', courseCode: '6921',
    name: '生物與永續科技專題討論（一）', department: '永續農業與綠色科技學位學程', officialSourceUrl: 'https://onepiece.nchu.edu.tw/cofsys/plsql/Syllabus?v_class_nbr=5507&v_strm=1151',
    departmentSourceUrl: 'https://bpbiot.nchu.edu.tw/', instructors: [{ name: '顏佩翎' }],
  },
  {
    id: 'course-ccu-current-course', universityId: 'ccu', term: '115-1', courseCode: '1151-CURRENT',
    name: '115-1 課程查詢', department: '各開課單位', officialSourceUrl: 'https://www026220.ccu.edu.tw/',
    departmentSourceUrl: 'https://oaa.ccu.edu.tw/', instructors: [{ name: '各課程授課教師' }],
  },
  {
    id: 'course-nsysu-current-course', universityId: 'nsysu', term: '115-1', courseCode: '1151-CURRENT',
    name: '115-1 當學期課程', department: '各開課單位', officialSourceUrl: 'https://selcrs.nsysu.edu.tw/menu1/qrycourse.asp',
    departmentSourceUrl: 'https://oaa.nsysu.edu.tw/', instructors: [{ name: '各課程授課教師' }],
  },
  {
    id: 'course-ntust-ac5004701', universityId: 'ntust', term: '115-1', courseCode: 'AC5004701',
    name: '電腦輔助設計／製造理論及實務', department: '自動化及控制研究所',
    officialSourceUrl: 'https://querycourse.ntust.edu.tw/QueryCourse/?CourseNo=AC5004701&Semester=1151',
    departmentSourceUrl: 'https://www.ac.ntust.edu.tw/', instructors: [{ name: '賴嘉宏' }],
  },
  {
    id: 'course-ntust-ac5413701', universityId: 'ntust', term: '115-1', courseCode: 'AC5413701',
    name: '型樣識別與機器學習', department: '自動化及控制研究所',
    officialSourceUrl: 'https://querycourse.ntust.edu.tw/QueryCourse/?CourseNo=AC5413701&Semester=1151',
    departmentSourceUrl: 'https://www.ac.ntust.edu.tw/', instructors: [{ name: '顏志達' }],
  },
  {
    id: 'course-ntut-362209', universityId: 'ntut', term: '115-1', courseCode: '362209',
    name: '量測技術及訊號處理', department: '機械工程系', officialSourceUrl: 'https://aps.ntut.edu.tw/course/tw/ShowSyllabus.jsp?code=12722&snum=362209',
    departmentSourceUrl: 'https://me1.ntut.edu.tw/', instructors: [{ name: '貝宇瀚' }],
  },
  {
    id: 'course-ntut-361486', universityId: 'ntut', term: '115-1', courseCode: '361486',
    name: '人工智慧', department: '機械工程系', officialSourceUrl: 'https://aps.ntut.edu.tw/course/tw/SearchProgram.jsp?code=690&format=-2&sem=1&year=115',
    departmentSourceUrl: 'https://me1.ntut.edu.tw/', instructors: [{ name: '陸一平' }],
  },
  {
    id: 'course-niu-freshman-camp', universityId: 'niu', term: '115-1', courseCode: 'MICRO-001',
    name: '大一新鮮人營隊', department: '外國語文學系',
    officialSourceUrl: 'https://academic.niu.edu.tw/var/file/3/1003/img/220/522057077.pdf',
    departmentSourceUrl: 'https://dfl.niu.edu.tw/', instructors: [{ name: '陳媛玲' }, { name: '賴軍維' }, { name: '陳惠如' }],
  },
];
