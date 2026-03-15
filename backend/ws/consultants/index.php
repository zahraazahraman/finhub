<?php
$_SERVER['PATH_INFO'] = str_replace('/FinHub/backend/ws/consultants/index.php', '', $_SERVER['REQUEST_URI']);
require_once __DIR__ . '/../WsConsultants.php';