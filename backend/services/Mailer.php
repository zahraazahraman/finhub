<?php
class Mailer {
    public static function send(string $toEmail, string $toName, string $subject, string $html, string $replyTo = ''): bool {
        $token = $_ENV['MAILTRAP_API_TOKEN'] ?? '';
        if (empty($token)) return false;

        $data = [
            'from'    => [
                'email' => $_ENV['MAIL_FROM'] ?? 'noreply@finhubapp.app',
                'name'  => 'FinHub',
            ],
            'to'      => [['email' => $toEmail, 'name' => $toName]],
            'subject' => $subject,
            'html'    => $html,
        ];

        if (!empty($replyTo)) {
            $data['reply_to'] = ['email' => $replyTo];
        }

        $payload = json_encode($data);

        $ch = curl_init('https://send.api.mailtrap.io/api/send');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token,
            ],
            CURLOPT_TIMEOUT => 10,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $httpCode >= 200 && $httpCode < 300;
    }
}