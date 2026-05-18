const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./db.sqlite");

/* =========================
   INIT TABLES
========================= */

db.serialize(() => {

db.run(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
role TEXT NOT NULL
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS jobs (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
location TEXT NOT NULL,
category TEXT NOT NULL,
description TEXT,
owner TEXT NOT NULL
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS applications (
id INTEGER PRIMARY KEY AUTOINCREMENT,
job_id INTEGER NOT NULL,
user_name TEXT NOT NULL,
status TEXT DEFAULT 'pending'
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS messages (
id INTEGER PRIMARY KEY AUTOINCREMENT,
sender TEXT NOT NULL,
receiver TEXT NOT NULL,
text TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

});

/* =========================
   USER (SAFE)
========================= */

app.post("/api/users", (req, res) => {
const { name, role } = req.body;

if (!name || !role) {
return res.json({ ok:false, message:"Eksik veri" });
}

db.run(
"INSERT INTO users (name,role) VALUES (?,?)",
[name, role],
function () {
res.json({ ok:true });
}
);
});

/* =========================
   JOB CREATE (SAFE)
========================= */

app.post("/api/jobs", (req, res) => {

const { title, location, category, description, owner } = req.body;

if (!title || !location || !category || !owner) {
return res.json({ ok:false, message:"Eksik ilan bilgisi" });
}

db.run(
"INSERT INTO jobs (title,location,category,description,owner) VALUES (?,?,?,?,?)",
[title, location, category, description || "", owner],
function () {
res.json({ ok:true, id:this.lastID });
}
);

});

/* =========================
   JOBS GET
========================= */

app.get("/api/jobs", (req, res) => {

const { category, location } = req.query;

let q = "SELECT * FROM jobs WHERE 1=1";
let p = [];

if (category) {
q += " AND category = ?";
p.push(category);
}

if (location) {
q += " AND location LIKE ?";
p.push("%" + location + "%");
}

q += " ORDER BY id DESC";

db.all(q, p, (err, rows) => {
res.json(rows);
});

});

/* =========================
   APPLY SAFE
========================= */

app.post("/api/apply", (req, res) => {

const { job_id, user_name } = req.body;

if (!job_id || !user_name) {
return res.json({ ok:false, message:"Eksik başvuru" });
}

db.get(
"SELECT * FROM applications WHERE job_id=? AND user_name=?",
[job_id, user_name],
(err, row) => {

if (row) return res.json({ ok:false, message:"Zaten başvurdun" });

db.run(
"INSERT INTO applications (job_id,user_name,status) VALUES (?,?, 'pending')",
[job_id, user_name],
function () {
res.json({ ok:true });
}
);

});

});

/* =========================
   APPLICANTS
========================= */

app.get("/api/applicants/:job_id", (req, res) => {

db.all(
"SELECT * FROM applications WHERE job_id=?",
[req.params.job_id],
(err, rows) => {
res.json(rows);
}
);

});

/* =========================
   DECISION
========================= */

app.post("/api/apply/decision", (req, res) => {

const { id, status } = req.body;

if (!id || !status) {
return res.json({ ok:false });
}

db.run(
"UPDATE applications SET status=? WHERE id=?",
[status, id],
function () {
res.json({ ok:true });
}
);

});

/* =========================
   MESSAGES
========================= */

app.post("/api/message", (req, res) => {

const { sender, receiver, text } = req.body;

if (!sender || !receiver || !text) {
return res.json({ ok:false, message:"Eksik mesaj" });
}

db.run(
"INSERT INTO messages (sender,receiver,text) VALUES (?,?,?)",
[sender, receiver, text],
function () {
res.json({ ok:true });
}
);

});

app.get("/api/messages/:a/:b", (req, res) => {

db.all(
`SELECT * FROM messages 
WHERE (sender=? AND receiver=?) 
OR (sender=? AND receiver=?)
ORDER BY id ASC`,
[req.params.a, req.params.b, req.params.b, req.params.a],
(err, rows) => {
res.json(rows);
}
);

});

/* =========================
   START
========================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log("V20 LIVE ON PORT " + PORT);
});