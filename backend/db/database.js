const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./ustabasi.db");

db.serialize(() => {

    console.log("Database hazır");

    // USERS
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT
        )
    `);

    // JOBS
    db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            location TEXT,
            budget TEXT,
            category TEXT,
            description TEXT
        )
    `);

});

module.exports = db;