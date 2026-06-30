"""SQLite helper. Stdlib only — swap DATABASE_URL for Postgres later."""
import sqlite3
from contextlib import contextmanager
from config import settings


def get_conn():
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def db():
    conn = get_conn()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'citizen',  -- citizen | authority | contractor
            ward TEXT,
            points INTEGER NOT NULL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reporter_id INTEGER NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,           -- pothole, garbage, water_leak, streetlight, ...
            severity TEXT,           -- low | medium | high | critical
            severity_score REAL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'reported',
                -- reported | verified | assigned | in_progress | resolved | rejected
            department TEXT,         -- roads | water | electricity | sanitation
            ward TEXT,
            lat REAL,
            lng REAL,
            image_url TEXT,
            resolution_image_url TEXT,
            duplicate_of INTEGER REFERENCES issues(id),
            upvotes INTEGER NOT NULL DEFAULT 0,
            recurrence_risk REAL DEFAULT 0,
            assigned_contractor_id INTEGER REFERENCES users(id),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            resolved_at TEXT
        );

        CREATE TABLE IF NOT EXISTS upvotes (
            user_id INTEGER NOT NULL REFERENCES users(id),
            issue_id INTEGER NOT NULL REFERENCES issues(id),
            PRIMARY KEY (user_id, issue_id)
        );

        CREATE TABLE IF NOT EXISTS verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            issue_id INTEGER NOT NULL REFERENCES issues(id),
            note TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS squads (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT,

            description TEXT,

            ward TEXT,

            leader_id INTEGER,

            type TEXT DEFAULT 'official',

            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS squad_members (
            squad_id INTEGER NOT NULL REFERENCES squads(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            PRIMARY KEY (squad_id, user_id)
        );
                        

        CREATE TABLE IF NOT EXISTS work_updates (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            issue_id INTEGER NOT NULL REFERENCES issues(id),

            contractor_id INTEGER NOT NULL REFERENCES users(id),

            description TEXT,

            progress_percent INTEGER,

            image_url TEXT,

            created_at TEXT DEFAULT CURRENT_TIMESTAMP

        );
                        
        CREATE TABLE IF NOT EXISTS points_history (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                user_id INTEGER,

                points INTEGER,

                reason TEXT,

                created_at TEXT DEFAULT CURRENT_TIMESTAMP

            );
                        
        CREATE TABLE IF NOT EXISTS maintenance_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            squad_id INTEGER,
            title TEXT,
            description TEXT,
            location TEXT,
            due_date TEXT,
            priority TEXT,
            status TEXT DEFAULT 'Assigned',
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
                        
        CREATE TABLE IF NOT EXISTS maintenance_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            worker_id INTEGER,
            before_photo TEXT,
            after_photo TEXT,
            remarks TEXT,
            status TEXT DEFAULT 'Pending',
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        

                # -------- Stage 2 Migration --------

        try:
            c.execute("ALTER TABLE issues ADD COLUMN assigned_by INTEGER")
        except:
            pass

        try:
            c.execute("ALTER TABLE issues ADD COLUMN assigned_at TEXT")
        except:
            pass

        try:
            c.execute("ALTER TABLE issues ADD COLUMN work_status TEXT DEFAULT 'pending'")
        except:
            pass

        try:
            c.execute("ALTER TABLE squads ADD COLUMN type TEXT DEFAULT 'official'")
        except:
            pass

        