const store = globalThis.__ustabasiStore || (globalThis.__ustabasiStore = {
  users: [],
  jobs: [],
  applications: [],
  messages: []
});

function send(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(body));
}

async function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => { raw += chunk; });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { resolve({}); }
    });
  });
}

export default async function handler(req, res) {
  const url = new URL(req.url || "/", "http://localhost");
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const route = parts[0] || "";
  const payload = await body(req);

  try {
    if (route === "users" && req.method === "POST") {
      const { name, role } = payload;
      if (!name || !role) return send(res, 400, { ok:false, message:"Eksik veri" });
      const existing = store.users.find((u) => u.name === name);
      if (existing) existing.role = role;
      else store.users.push({ id: store.users.length + 1, name, role });
      return send(res, 200, { ok:true });
    }

    if (route === "jobs" && req.method === "POST") {
      const { title, location, category, description, owner } = payload;
      if (!title || !location || !category || !owner) {
        return send(res, 400, { ok:false, message:"Eksik ilan bilgisi" });
      }
      const id = store.jobs.length + 1;
      store.jobs.unshift({ id, title, location, category, description: description || "", owner });
      return send(res, 201, { ok:true, id });
    }

    if (route === "jobs" && req.method === "GET") {
      const category = url.searchParams.get("category");
      const location = url.searchParams.get("location");
      const rows = store.jobs.filter((job) =>
        (!category || job.category === category) &&
        (!location || job.location.toLowerCase().includes(location.toLowerCase()))
      );
      return send(res, 200, rows);
    }

    if (route === "apply" && req.method === "POST" && parts.length === 1) {
      const { job_id, user_name } = payload;
      if (!job_id || !user_name) return send(res, 400, { ok:false, message:"Eksik başvuru" });
      const exists = store.applications.find((a) => a.job_id == job_id && a.user_name === user_name);
      if (exists) return send(res, 409, { ok:false, message:"Zaten başvurdun" });
      const id = store.applications.length + 1;
      store.applications.push({ id, job_id, user_name, status:"pending" });
      return send(res, 201, { ok:true });
    }

    if (route === "apply" && parts[1] === "decision" && req.method === "POST") {
      const { id, status } = payload;
      if (!id || !status) return send(res, 400, { ok:false, message:"Eksik veri" });
      const row = store.applications.find((a) => a.id == id);
      if (!row) return send(res, 404, { ok:false, message:"Başvuru bulunamadı" });
      row.status = status;
      return send(res, 200, { ok:true });
    }

    if (route === "applicants" && parts[1] && req.method === "GET") {
      return send(res, 200, store.applications.filter((a) => a.job_id == parts[1]));
    }

    if (route === "message" && req.method === "POST") {
      const { sender, receiver, text } = payload;
      if (!sender || !receiver || !text) return send(res, 400, { ok:false, message:"Eksik mesaj" });
      const id = store.messages.length + 1;
      store.messages.push({ id, sender, receiver, text, created_at:new Date().toISOString() });
      return send(res, 201, { ok:true });
    }

    if (route === "messages" && parts[1] && parts[2] && req.method === "GET") {
      const a = decodeURIComponent(parts[1]);
      const b = decodeURIComponent(parts[2]);
      const rows = store.messages.filter((m) =>
        (m.sender === a && m.receiver === b) || (m.sender === b && m.receiver === a)
      );
      return send(res, 200, rows.sort((x,y) => x.id - y.id));
    }

    if (!route) return send(res, 200, { ok:true, service:"ustabasi-api" });
    return send(res, 404, { ok:false, message:"Endpoint bulunamadı" });
  } catch (error) {
    console.error(error);
    return send(res, 500, { ok:false, message:"Sunucu hatası" });
  }
}
