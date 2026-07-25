// Cloudflare Worker backing the_ai_game_factory's landing page and play page.
//
// GET /games returns the game list as JSON. The list itself is not computed
// here -- it's pushed into GAMES_KV wholesale by scripts/build_games_json.mjs
// via a GitHub Actions job on every push to main, so this Worker is a thin,
// always-fresh read cache, not a source of truth for game metadata.
//
// GET /ratings and POST /ratings/:slug back the 1-5 star rating feature.
// Unlike the game list, ratings are live, per-visitor state, so they're kept
// as their own KV keys (rating:<slug>) rather than folded into games_list.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const VOTE_TTL_SECONDS = 24 * 60 * 60;

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}

function json(data, status) {
  return withCors(
    new Response(JSON.stringify(data), {
      status: status || 200,
      headers: { "Content-Type": "application/json" },
    })
  );
}

async function getGamesList(env) {
  const raw = await env.GAMES_KV.get("games_list");
  return raw ? JSON.parse(raw) : [];
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function computeStats(entry) {
  if (!entry || !entry.count) return { avg: null, count: 0 };
  return { avg: Math.round((entry.sum / entry.count) * 10) / 10, count: entry.count };
}

async function handleGetRatings(env) {
  const games = await getGamesList(env);
  const entries = await Promise.all(
    games.map(async (game) => {
      const raw = await env.GAMES_KV.get(`rating:${game.slug}`);
      const stats = computeStats(raw ? JSON.parse(raw) : null);
      return [game.slug, stats];
    })
  );
  entries.sort((a, b) => {
    const avgA = a[1].avg === null ? -1 : a[1].avg;
    const avgB = b[1].avg === null ? -1 : b[1].avg;
    return avgB - avgA;
  });
  return json(Object.fromEntries(entries));
}

async function handlePostRating(env, request, slug) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "invalid JSON body" }, 400);
  }
  const value = body && body.value;
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return json({ error: "value must be an integer 1-5" }, 400);
  }

  const games = await getGamesList(env);
  if (!games.some((g) => g.slug === slug)) {
    return json({ error: "unknown game" }, 400);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const today = new Date().toISOString().slice(0, 10);
  const voteKey = `vote:${await sha256Hex(`${slug}:${ip}:${today}`)}`;

  const alreadyVoted = await env.GAMES_KV.get(voteKey);
  const ratingKey = `rating:${slug}`;

  if (alreadyVoted) {
    const raw = await env.GAMES_KV.get(ratingKey);
    const stats = computeStats(raw ? JSON.parse(raw) : null);
    return json({ ...stats, accepted: false });
  }

  const raw = await env.GAMES_KV.get(ratingKey);
  const current = raw ? JSON.parse(raw) : { sum: 0, count: 0 };
  const updated = { sum: current.sum + value, count: current.count + 1 };

  await env.GAMES_KV.put(ratingKey, JSON.stringify(updated));
  await env.GAMES_KV.put(voteKey, "1", { expirationTtl: VOTE_TTL_SECONDS });

  return json({ ...computeStats(updated), accepted: true });
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

    if (url.pathname === "/ratings" && request.method === "GET") {
      return handleGetRatings(env);
    }

    const ratingMatch = url.pathname.match(/^\/ratings\/([^/]+)$/);
    if (ratingMatch && request.method === "POST") {
      return handlePostRating(env, request, decodeURIComponent(ratingMatch[1]));
    }

    return withCors(new Response("Not found", { status: 404 }));
  },
};
