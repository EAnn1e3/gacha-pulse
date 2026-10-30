const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
function authorized(request, env) {
  const token = env.ADMIN_TOKEN;
  return Boolean(token && request.headers.get("Authorization") === `Bearer ${token}`);
}
export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: "DB_NOT_CONFIGURED" }, 503);
  try {
    const result = await env.DB.prepare(`SELECT e.*, g.name AS game_name, g.short_name
      FROM events e JOIN games g ON g.id=e.game_id ORDER BY COALESCE(e.ends_at,e.starts_at) ASC LIMIT 300`).all();
    return json({ events: result.results || [], generatedAt: new Date().toISOString() });
  } catch (e) { return json({ error: "QUERY_FAILED", message: String(e?.message || e) }, 500); }
}
export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return json({ error: "UNAUTHORIZED", message: "Set ADMIN_TOKEN secret and send Authorization: Bearer <token>." }, 401);
  if (!env.DB) return json({ error: "DB_NOT_CONFIGURED" }, 503);
  let b; try { b = await request.json(); } catch { return json({ error: "INVALID_JSON" }, 400); }
  const required = ["game_id", "title", "event_type", "region"];
  if (required.some(k => b[k] == null || String(b[k]).trim() === "")) return json({ error: "MISSING_FIELDS", required }, 400);
  const allowed = ["event", "patch", "maintenance", "banner", "reset"];
  if (!allowed.includes(b.event_type)) return json({ error: "INVALID_EVENT_TYPE" }, 400);
  try {
    const r = await env.DB.prepare(`INSERT INTO events
      (game_id,title,event_type,region,starts_at,ends_at,source_url,source_name,verified_at,status,notes,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,strftime('%Y-%m-%dT%H:%M:%fZ','now'))`)
      .bind(Number(b.game_id), String(b.title).trim(), b.event_type, String(b.region),
        b.starts_at || null, b.ends_at || null, b.source_url || null, b.source_name || null,
        b.verified_at || null, b.status || "unconfirmed", b.notes || null).run();
    return json({ ok: true, id: r.meta?.last_row_id });
  } catch (e) { return json({ error: "INSERT_FAILED", message: String(e?.message || e) }, 500); }
}
export async function onRequestDelete({ request, env }) {
  if (!authorized(request, env)) return json({ error: "UNAUTHORIZED" }, 401);
  if (!env.DB) return json({ error: "DB_NOT_CONFIGURED" }, 503);
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return json({ error: "INVALID_ID" }, 400);
  try {
    await env.DB.prepare("DELETE FROM events WHERE id=?").bind(id).run();
    return json({ ok: true, id });
  } catch (e) { return json({ error: "DELETE_FAILED", message: String(e?.message || e) }, 500); }
}
