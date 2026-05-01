<?php
session_start();
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../bll/BillBLL.php';

AuthMiddleware::verifyUser();
$user   = AuthMiddleware::getUser();
$userId = (int)$user['user_id'];

$bll    = new BillBLL();
$result = $bll->sendDueReminders($userId, $user);
echo json_encode($result);