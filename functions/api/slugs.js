export async function onRequestPost({ env, request }) {
  let body; try { body = await request.json(); } catch {}
  const { slug, path, note, overwrite = true } = body || {};
  if (!slug || !/^[a-z0-9-]{1,32}$/.test(slug)) return json({ ok:false, error:'INVALID_SLUG' }, 400);
  if (!path || !path.startsWith('/')) return json({ ok:false, error:'INVALID_PATH' }, 400);

  const exists = await env.SLUGS.get(slug, { type: 'json' });
  if (exists && !overwrite) return json({ ok:false, error:'ALREADY_EXISTS' }, 409);

  const rec = { path, note: note || '', updatedAt: new Date().toISOString() };
  await env.SLUGS.put(slug, JSON.stringify(rec));
  return json({ ok:true, slug, path, rec });
}
const json = (obj, status=200)=> new Response(JSON.stringify(obj), {
  status, headers: { 'content-type':'application/json', 'cache-control':'no-store' }
});
