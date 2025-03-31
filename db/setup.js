const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/messages.db')

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS
        messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`)
})

db.close();