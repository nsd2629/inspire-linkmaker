export async function onRequestGet({ env, params, request }) {
  const slug = params.slug?.toLowerCase();
  if (!slug || !/^[a-z0-9-]{1,32}$/.test(slug)) return new Response('Not found', { status: 404 });

  const rec = await env.SLUGS.get(slug, { type: 'json' });
  if (!rec || !rec.path) return new Response('No slug mapping', { status: 404 });

  const now = new URL(request.url);
  const target = new URL(rec.path.startsWith('/') ? rec.path : '/'+rec.path, now.origin);

  // /s/<slug>?utm_* → 대상에 없을 때만 보존
  const inQs = new URL(request.url).searchParams;
  for (const [k, v] of inQs.entries()) {
    if (k.startsWith('utm_') && !target.searchParams.has(k)) target.searchParams.set(k, v);
  }
  return new Response(null, { status: 302, headers: { Location: target.toString(), 'Cache-Control': 'no-store' } });
}
