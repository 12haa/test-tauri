<?php
require_once 'db.php';
$pdo = getDB();

$pdo->exec("
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now'))
);
");

echo "Migration done.\n";
