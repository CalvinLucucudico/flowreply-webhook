<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$verify_token = "flowreply_verify_token_2026";

// 1. Verificação oficial da Meta (Instagram / Facebook)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $mode = $_GET['hub_mode'] ?? '';
    $token = $_GET['hub_verify_token'] ?? '';
    $challenge = $_GET['hub_challenge'] ?? '';
    
    if ($mode === 'subscribe' && $token === $verify_token) {
        http_response_code(200);
        echo $challenge;
        exit;
    }
    http_response_code(403);
    echo "Token de verificação inválido.";
    exit;
}

// 2. Recepção de eventos (Comentários e Mensagens)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    file_put_contents(__DIR__ . '/meta_events.log', date('Y-m-d H:i:s') . " - " . $input . PHP_EOL, FILE_APPEND);
    http_response_code(200);
    echo "EVENT_RECEIVED";
    exit;
}
?>
