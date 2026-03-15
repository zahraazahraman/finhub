<?php
$_SERVER['PATH_INFO'] = str_replace('/FinHub/backend/ws/user-notifications/index.php', '', strtok($_SERVER['REQUEST_URI'], '?'));
require_once __DIR__ . '/../WsUserNotifications.php';
