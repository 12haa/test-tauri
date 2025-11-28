<?php
// src/db.php
function getDB(): PDO {
    $path = __DIR__ . '/../data/app.db';
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $pdo = new PDO('sqlite:' . $path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // تعویض mode برای concurrency اگر نیاز بود: PRAGMA journal_mode=WAL;
    $pdo->exec('PRAGMA journal_mode = WAL;');
    return $pdo;
}
