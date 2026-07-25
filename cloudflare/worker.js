// Cloudflare Worker backing the_ai_game_factory's landing page.
//
// GET /games returns the game list as JSON. The list itself is not computed
// here -- it's pushed into GAMES_KV wholesale by scripts/build_games_json.mjs
// via a GitHub Actions job on every push to main, so this Worker is a thin,
// always-fresh read cache, not a source of truth.
//
// Structured so future routes (e.g. GET/POST /ratings/:slug) can be added as
// additional pathname checks below without restructuring this file.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (url.pathname === "/games" && request.method === "GET") {
      const data = await env.GAMES_KV.get("games_list");
      return withCors(
        new Response(data || "[]", {
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    return withCors(new Response("Not found", { status: 404 }));
  },
};
