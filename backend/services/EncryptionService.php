<?php
require_once __DIR__ . '/../config/config.php';

class EncryptionService {
    private const CIPHER   = 'aes-256-gcm';
    private const NONCE_LEN = 12;
    private const TAG_LEN   = 16;

    private string $key;

    public function __construct() {
        $hex = $_ENV['ENCRYPTION_KEY'] ?? '';
        if (strlen($hex) !== 64 || !ctype_xdigit($hex)) {
            throw new RuntimeException('ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
        }
        $this->key = hex2bin($hex);
    }

    // Returns a base64-encoded blob: nonce(12) + ciphertext + tag(16)
    public function encrypt(string $plaintext): string {
        $nonce = random_bytes(self::NONCE_LEN);
        $tag   = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $nonce,
            $tag,
            '',
            self::TAG_LEN
        );

        if ($ciphertext === false) {
            throw new RuntimeException('Encryption failed.');
        }

        return base64_encode($nonce . $ciphertext . $tag);
    }

    // Accepts the blob produced by encrypt() and returns the original plaintext.
    public function decrypt(string $blob): string {
        $raw = base64_decode($blob, strict: true);
        if ($raw === false) {
            throw new RuntimeException('Decryption failed: invalid base64.');
        }

        $minLen = self::NONCE_LEN + self::TAG_LEN + 1;
        if (strlen($raw) < $minLen) {
            throw new RuntimeException('Decryption failed: payload too short.');
        }

        $nonce      = substr($raw, 0, self::NONCE_LEN);
        $tag        = substr($raw, -self::TAG_LEN);
        $ciphertext = substr($raw, self::NONCE_LEN, -self::TAG_LEN);

        $plaintext = openssl_decrypt(
            $ciphertext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $nonce,
            $tag
        );

        if ($plaintext === false) {
            throw new RuntimeException('Decryption failed: authentication tag mismatch.');
        }

        return $plaintext;
    }
}
