<?php
require_once __DIR__ . '/../dal/CurrencyDAL.php';

class CurrencyBLL {
    private CurrencyDAL $dal;

    public function __construct() {
        $this->dal = new CurrencyDAL();
    }

    public function getAll(): array {
        return $this->dal->getAll();
    }
}
