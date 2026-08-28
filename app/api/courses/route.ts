import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/db';
import { listCourses } from '@/db/courses';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const universityId = params.get('university_id')?.trim() || undefined;
  const department = params.get('department')?.trim().slice(0, 80) || undefined;
  const search = params.get('search')?.trim().slice(0, 80) || undefined;
  const term = params.get('term')?.trim() || undefined;
  const limit = Number.parseInt(params.get('limit') || '36', 10);
  const offset = Number.parseInt(params.get('offset') || '0', 10);
  if (universityId && !/^[a-z0-9-]{2,20}$/.test(universityId)) {
    return NextResponse.json({ error: '學校代碼格式不正確。' }, { status: 400 });
  }
  if (term && !/^1(?:0[6-9]|1[0-5])-[12]$/.test(term)) {
    return NextResponse.json({ error: '學期格式不正確。' }, { status: 400 });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 60 || !Number.isInteger(offset) || offset < 0 || offset > 100000) {
    return NextResponse.json({ error: '分頁參數不正確。' }, { status: 400 });
  }
  await ensureDatabase();
  return NextResponse.json(await listCourses({ universityId, department, search, term, limit, offset }), {
    headers: { 'Cache-Control': 'public, max-age=30, s-maxage=120' },
  });
}
