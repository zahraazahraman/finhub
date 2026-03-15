<?php
$uri = $_SERVER['REQUEST_URI'];
$base = '/FinHub/backend/ws/admin-notifications/index.php';
$_SERVER['PATH_INFO'] = str_replace($base, '', strtok($uri, '?'));
require_once __DIR__ . '/../WsAdminNotifications.php';