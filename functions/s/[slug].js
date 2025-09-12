
export const onRequestGet = async (ctx) => {
  const { SLUGS } = ctx.env;
  const slug = ctx.params.slug;

  let target;
  if (SLUGS) {
    try { target = await SLUGS.get(slug); } catch(e){}
  }
  if (!target) {
    const url = new URL(ctx.request.url);
    const host = url.origin;
    const res = await fetch(`${host}/data/slugs.json`, { cf: { cacheTtl: 30 }});
    try {
      const map = await res.json();
      target = map[slug];
    } catch(e){}
  }
  if (!target) return new Response("Not Found", { status: 404 });

  const commit = ctx.env.COMMIT_SHA || "dev";
  const turl = new URL(target);
  if (!turl.searchParams.has("v")) {
    turl.searchParams.set("v", commit);
  }
  return Response.redirect(turl.toString(), 302);
};
