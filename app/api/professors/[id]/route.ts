import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/db';
import { getProfessor } from '@/db/professors';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-z0-9-]{2,80}$/i.test(id)) return NextResponse.json({ error: '教授代碼格式不正確。' }, { status: 400 });
  await ensureDatabase();
  const professor = await getProfessor(id);
  if (!professor) return NextResponse.json({ error: '找不到教授資料。' }, { status: 404 });
  return NextResponse.json({ professor });
}
