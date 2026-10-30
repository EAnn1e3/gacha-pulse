export async function onRequestGet({ env }) {
  if (!env.DB) {
    return Response.json({ ok: false, error: "DB_NOT_CONFIGURED", message: "Bind D1 as DB in Pages Settings > Bindings." }, { status: 503 });
  }
  try {
    const row = await env.DB.prepare("SELECT 1 AS ok").first();
    return Response.json({ ok: row?.ok === 1, database: "connected", checkedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ ok: false, error: "DB_QUERY_FAILED", message: String(error?.message || error) }, { status: 500 });
  }
}
