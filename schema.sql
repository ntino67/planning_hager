CREATE TABLE IF NOT EXISTS sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS planning (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    sector_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    shift INTEGER NOT NULL, -- 0: 4AM-12AM, 1: 12AM-20PM, 2: 20PM-4AM
    status INTEGER NOT NULL, -- 0: present, 1: planned absence, 2: unplanned absence, 3: formation in team, 4: formation whole day, 5: sorting on post
    FOREIGN KEY (sector_id) REFERENCES sectors(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
