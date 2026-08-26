const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '';

export function GET() {
  if (!/^ca-pub-\d+$/.test(client)) {
    return new Response('AdSense 尚未設定。\n', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const publisherId = client.replace(/^ca-/, '');
  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
