import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/db';
import { listCourses } from '@/db/courses';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const universityId = params.get('university_id')?.trim() || undefined;
  const department = params.get('department')?.trim().slice(0, 80) || undefined;
  const search = params.get('search')?.trim().slice(0, 80) || undefined;
  if (universityId && !/^[a-z0-9-]{2,20}$/.test(universityId)) {
    return NextResponse.json({ error: '學校代碼格式不正確。' }, { status: 400 });
  }
  await ensureDatabase();
  return NextResponse.json({ courses: await listCourses({ universityId, department, search }) }, {
    headers: { 'Cache-Control': 'public, max-age=30, s-maxage=120' },
  });
}
