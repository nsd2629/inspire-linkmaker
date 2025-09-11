export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only handle /s/<slug>
    if (url.pathname.startsWith('/s/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const slug = decodeURIComponent(parts[1] || '');

      if (!slug) {
        return new Response('Missing slug', { status: 404 });
      }

      try {
        // Load slug map from static asset
        const mapReq = new Request(new URL('/data/slugs.json', url));
        const mapRes = await env.ASSETS.fetch(mapReq);
        if (mapRes.ok) {
          const map = await mapRes.json();
          const entry = map[slug];
          if (entry && entry.path) {
            // Compose final URL relative to current origin
            const target = new URL(entry.path, url.origin);

            // Preserve incoming utm_* params if present
            for (const [k, v] of url.searchParams) {
              if (k.startsWith('utm_') && !target.searchParams.has(k)) {
                target.searchParams.set(k, v);
              }
            }

            // 302 (temporary)
            return Response.redirect(target.toString(), 302);
          }
        }
      } catch (e) {
        return new Response('Redirect error', { status: 500 });
      }

      return new Response('Short link not found', { status: 404, headers: {'content-type': 'text/plain; charset=utf-8'} });
    }

    // Default: serve static assets
    return env.ASSETS.fetch(request);
  }
};
