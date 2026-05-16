<?php
$_SERVER['PATH_INFO'] = str_replace('/FinHub/backend/ws/consultant-profile/index.php', '', $_SERVER['REQUEST_URI']);
require_once __DIR__ . '/../WsConsultantProfile.php';
