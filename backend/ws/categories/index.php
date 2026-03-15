<?php
$_SERVER['PATH_INFO'] = str_replace('/FinHub/backend/ws/categories/index.php', '', $_SERVER['REQUEST_URI']);
require_once __DIR__ . '/../WsCategories.php';