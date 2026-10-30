export async function onRequestGet({ request, env }) {
  if (!env.DB) return Response.json({ error: "DB_NOT_CONFIGURED" }, { status: 503 });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const region = (url.searchParams.get("region") || "").trim();
  try {
    let sql = `SELECT g.id, g.slug, g.name, g.short_name, g.developer, g.regions, g.official_url, g.source_url,
      (SELECT COUNT(*) FROM events e WHERE e.game_id=g.id AND e.status != 'ended') AS upcoming_count
      FROM games g WHERE g.enabled=1`;
    const params = [];
    if (q) { sql += " AND (g.name LIKE ? OR g.short_name LIKE ? OR g.developer LIKE ?)"; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    if (region) { sql += " AND (',' || REPLACE(g.regions,' ','') || ',') LIKE ?"; params.push(`%,${region},%`); }
    sql += " ORDER BY g.name COLLATE NOCASE";
    const games = await env.DB.prepare(sql).bind(...params).all();
    const events = await env.DB.prepare(`SELECT e.*, g.name AS game_name, g.short_name
      FROM events e JOIN games g ON g.id=e.game_id
      WHERE e.status != 'ended' ORDER BY CASE WHEN e.ends_at IS NULL THEN 1 ELSE 0 END, e.ends_at ASC LIMIT 150`).all();
    return Response.json({ games: games.results || [], events: events.results || [], generatedAt: new Date().toISOString() }, {
      headers: { "Cache-Control": "public, max-age=30", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return Response.json({ error: "QUERY_FAILED", message: String(error?.message || error) }, { status: 500 });
  }
}
