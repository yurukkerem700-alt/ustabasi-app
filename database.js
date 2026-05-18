const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./ustabasi.db");

// USERS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
)
`);

// JOBS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    location TEXT,
    budget INTEGER,
    createdBy INTEGER
)
`);

module.exports = db;