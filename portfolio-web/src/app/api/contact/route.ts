export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

    const res = await fetch(`${apiUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    return Response.json(data, { status: res.status });
  } catch (error) {
    console.error('[POST /api/contact] Proxy error:', error);
    return Response.json(
      { message: 'Failed to forward message to the server. Please try again.' },
      { status: 502 },
    );
  }
}
