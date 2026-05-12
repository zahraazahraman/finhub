<?php
class Database {
    private static ?PDO $instance = null;
    private function __construct() {}
    public static function getInstance(): PDO {
        if (self::$instance === null) {
            $host = $_ENV['DB_HOST'] ?? 'localhost';
            $db   = $_ENV['DB_NAME'] ?? 'FinHub';
            $user = $_ENV['DB_USER'] ?? 'root';
            $pass = $_ENV['DB_PASS'] ?? '';
            $dsn  = "mysql:host=$host;dbname=$db;charset=utf8mb4";
            self::$instance = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            // Ensure the MySQL session timezone is UTC so comparisons with PHP times are consistent.
            try {
                self::$instance->exec("SET time_zone = '+00:00'");
            } catch (Exception $e) {
                // Ignore — if the DB user lacks privileges this will fail, but PHP UTC still helps.
            }
        }
        return self::$instance;
    }
}