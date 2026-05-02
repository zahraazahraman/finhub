<?php
$_SERVER['PATH_INFO'] = str_replace('/FinHub/backend/ws/my-notifications/index.php', '', strtok($_SERVER['REQUEST_URI'], '?'));
require_once __DIR__ . '/../WsMyNotifications.php';