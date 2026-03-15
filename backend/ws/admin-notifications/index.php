<?php
$uri   = $_SERVER['REQUEST_URI'];
$base  = '/FinHub/backend/ws/admin-notifications/index.php';
$path  = str_replace($base, '', strtok($uri, '?'));
$_SERVER['PATH_INFO'] = $path !== '' ? $path : '/';
require_once __DIR__ . '/../WsAdminNotifications.php';
