<?php
require_once 'db.php';
$pdo = getDB();

// هدر CORS برای توسعه
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// ثبت نام
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $path === '/register') {
    $body = json_decode(file_get_contents('php://input'), true);
    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';

    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['ok'=>false,'error'=>'missing fields']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (username,password) VALUES (?,?)');
    try {
        $stmt->execute([$username,$hash]);
        echo json_encode(['ok'=>true,'id'=>$pdo->lastInsertId()]);
    } catch(PDOException $e) {
        http_response_code(400);
        echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
    }
    exit;
}

// ورود
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $path === '/login') {
    $body = json_decode(file_get_contents('php://input'), true);
    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';

    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['ok'=>false,'error'=>'missing fields']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE username=? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password,$user['password'])) {
        echo json_encode(['ok'=>true,'user'=>['id'=>$user['id'],'username'=>$user['username']],'message'=>'Login successful']);
    } else {
        http_response_code(401);
        echo json_encode(['ok'=>false,'error'=>'invalid credentials']);
    }
    exit;
}

// fallback
http_response_code(404);
echo json_encode(['ok'=>false,'error'=>'not found']);
