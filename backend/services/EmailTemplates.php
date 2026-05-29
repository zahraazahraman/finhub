<?php
class EmailTemplates {

  public static function verificationCode(string $firstName, string $code): string {
    $name = htmlspecialchars($firstName);
    // Split the 6-digit code into individual characters for styled display
    $digits = '';
    foreach (str_split($code) as $d) {
      $digits .= "<span style='
        display:inline-block;
        width:42px; height:52px;
        line-height:52px;
        text-align:center;
        font-size:26px;
        font-weight:700;
        color:#0f172a;
        background:#f1f5f9;
        border-radius:8px;
        margin:0 4px;
        letter-spacing:0;
      '>{$d}</span>";
    }

    return "
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width'>
      </head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
        <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>

          <div style='background:#16a34a;padding:28px 32px;'>
            <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
            <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Email Verification</div>
          </div>

          <div style='padding:36px 32px;'>
            <h2 style='margin:0 0 8px;font-size:20px;color:#0f172a;font-weight:700;'>Verify your email address</h2>
            <p style='margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;'>
              Hi {$name}, use the code below to verify your FinHub account.
              This code expires in <strong style='color:#0f172a;'>15 minutes</strong>.
            </p>

            <div style='text-align:center;padding:28px 0;background:#f8fafc;border-radius:10px;margin-bottom:28px;'>
              {$digits}
            </div>

            <p style='margin:0;color:#94a3b8;font-size:12px;line-height:1.6;'>
              If you did not create a FinHub account, you can safely ignore this email.
              Never share this code with anyone.
            </p>
          </div>

          <div style='padding:14px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;'>
            <p style='color:#94a3b8;font-size:11px;margin:0;'>Sent from FinHub · noreply@finhubapp.app</p>
          </div>

        </div>
      </body>
    </html>";
  }

  public static function reminder(array $r, string $userTimezone = 'UTC'): string {
    $name    = htmlspecialchars($r['bill_name']);
    $amount  = htmlspecialchars($r['currency_symbol'] . number_format((float)$r['amount'], 2));
    // Convert stored due_date (assumed UTC) to user's timezone for display
    try {
      $dt = DateTime::createFromFormat('Y-m-d H:i:s', $r['due_date'], new DateTimeZone('UTC'));
      if ($dt === false) {
        $due = htmlspecialchars($r['due_date']);
      } else {
        if (!in_array($userTimezone, DateTimeZone::listIdentifiers(), true)) $userTimezone = 'UTC';
        $dt->setTimezone(new DateTimeZone($userTimezone));
        $due = htmlspecialchars($dt->format('F j, Y'));
      }
    } catch (Exception $e) {
      $due = htmlspecialchars(date('F j, Y', strtotime($r['due_date'])));
    }
    $message = htmlspecialchars($r['message']);
    $days    = (int)$r['days_before'];
    $dayWord = $days === 1 ? 'day' : 'days';

    return "
    <!DOCTYPE html>
    <html>
      <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width'>
      </head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
          <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>
            <div style='background:#16a34a;padding:28px 32px;'>
                <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
                <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Bill Reminder</div>
            </div>
            <div style='padding:32px;'>
                <h2 style='margin:0 0 6px;font-size:18px;color:#0f172a;'>Payment Due Soon</h2>
                <p style='margin:0 0 24px;color:#64748b;font-size:14px;'>{$message}</p>
                <table width='100%' cellpadding='0' cellspacing='0' style='background:#f1f5f9;border-radius:8px;'>
                  <tr>
                      <td style='padding:16px 20px;'>
                        <table width='100%' cellpadding='0' cellspacing='0'>
                            <tr>
                              <td style='color:#64748b;font-size:13px;padding-bottom:10px;'>Bill</td>
                              <td style='color:#0f172a;font-size:13px;font-weight:600;text-align:right;padding-bottom:10px;'>{$name}</td>
                            </tr>
                            <tr>
                              <td style='color:#64748b;font-size:13px;padding-bottom:10px;'>Amount</td>
                              <td style='color:#0f172a;font-size:13px;font-weight:600;text-align:right;padding-bottom:10px;'>{$amount}</td>
                            </tr>
                            <tr>
                              <td style='color:#64748b;font-size:13px;'>Due Date</td>
                              <td style='color:#0f172a;font-size:13px;font-weight:600;text-align:right;'>{$due}</td>
                            </tr>
                        </table>
                      </td>
                  </tr>
                </table>
                <p style='color:#94a3b8;font-size:12px;margin:24px 0 0;'>You set this reminder {$days} {$dayWord} before the due date in FinHub.</p>
            </div>
          </div>
      </body>
    </html>";
  }

    public static function weeklySummary(array $user, array $allBills, array $upcoming, string $userTimezone = 'UTC'): string {
    $firstName   = htmlspecialchars($user['first_name']);
    // Use user's timezone for the summary date
    try {
      $tz = in_array($userTimezone, DateTimeZone::listIdentifiers(), true) ? $userTimezone : 'UTC';
      $date = (new DateTime('now', new DateTimeZone('UTC')))->setTimezone(new DateTimeZone($tz))->format('F j, Y');
    } catch (Exception $e) {
      $date = date('F j, Y');
    }
    $totalBills  = count($allBills);
    $unpaidCount = count(array_filter($allBills, fn($b) => !$b['is_paid']));

    $rows = '';
    if (count($upcoming) > 0) {
            foreach ($upcoming as $b) {
            $bName   = htmlspecialchars($b['name']);
            $bAmount = htmlspecialchars($b['currency_symbol'] . number_format((float)$b['amount'], 2));
            // Convert due_date to user's timezone for display
            try {
              $bdt = DateTime::createFromFormat('Y-m-d H:i:s', $b['due_date'], new DateTimeZone('UTC'));
              if ($bdt === false) {
                $bDue = htmlspecialchars(date('M j', strtotime($b['due_date'])));
              } else {
                if (!in_array($userTimezone, DateTimeZone::listIdentifiers(), true)) $userTimezone = 'UTC';
                $bdt->setTimezone(new DateTimeZone($userTimezone));
                $bDue = htmlspecialchars($bdt->format('M j'));
              }
            } catch (Exception $e) {
              $bDue = htmlspecialchars(date('M j', strtotime($b['due_date'])));
            }
            $rows   .= "<tr>
              <td style='padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;'>{$bName}</td>
              <td style='padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:13px;font-weight:600;text-align:right;'>{$bAmount}</td>
              <td style='padding:10px 0;border-bottom:1px solid #f1f5f9;color:#ef4444;font-size:13px;font-weight:600;text-align:right;'>{$bDue}</td>
            </tr>";
        }
        $upcomingSection = "<h3 style='color:#0f172a;font-size:15px;margin:24px 0 12px;'>Bills Due This Week</h3>
          <table width='100%' cellpadding='0' cellspacing='0'>
            <tr>
              <th style='text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;padding-bottom:8px;'>Bill</th>
              <th style='text-align:right;color:#94a3b8;font-size:11px;text-transform:uppercase;padding-bottom:8px;'>Amount</th>
              <th style='text-align:right;color:#94a3b8;font-size:11px;text-transform:uppercase;padding-bottom:8px;'>Due</th>
            </tr>
            {$rows}
          </table>";
    } else {
        $upcomingSection = "<p style='color:#64748b;font-size:14px;margin:24px 0 0;'>No bills due in the next 7 days. 🎉</p>";
    }

    return "
    <!DOCTYPE html>
    <html>
      <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width'>
      </head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
          <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>
            <div style='background:#16a34a;padding:28px 32px;'>
                <div style='font-size:20px;font-weight:700;color:#fff;'>FinHub</div>
                <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Weekly Summary — {$date}</div>
            </div>
            <div style='padding:32px;'>
                <h2 style='margin:0 0 4px;font-size:18px;color:#0f172a;'>Hi {$firstName} !</h2>
                <p style='margin:0 0 24px;color:#64748b;font-size:14px;'>Here's your bills overview for this week.</p>
                <table width='100%' cellpadding='0' cellspacing='0'>
                  <tr>
                      <td width='48%' style='background:#f0fdf4;border-radius:8px;padding:16px;text-align:center;'>
                        <div style='font-size:26px;font-weight:700;color:#16a34a;'>{$totalBills}</div>
                        <div style='color:#64748b;font-size:12px;margin-top:4px;'>Total Bills</div>
                      </td>
                      <td width='4%'></td>
                      <td width='48%' style='background:#fff7ed;border-radius:8px;padding:16px;text-align:center;'>
                        <div style='font-size:26px;font-weight:700;color:#ea580c;'>{$unpaidCount}</div>
                        <div style='color:#64748b;font-size:12px;margin-top:4px;'>Unpaid</div>
                      </td>
                  </tr>
                </table>
                {$upcomingSection}
            </div>
            <div style='padding:14px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;'>
                <p style='color:#94a3b8;font-size:11px;margin:0;'>Sent from FinHub · noreply@finhubapp.app</p>
            </div>
          </div>
      </body>
    </html>
    ";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Password reset — sent when the user requests a password reset link.
  // $resetUrl must be built from a hardcoded APP_URL (never from HTTP_HOST).
  // ─────────────────────────────────────────────────────────────────────────────
  public static function passwordReset(string $firstName, string $resetUrl): string {
    $name = htmlspecialchars($firstName);
    $url  = htmlspecialchars($resetUrl);

    return "
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width'>
      </head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
        <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>

          <div style='background:#16a34a;padding:28px 32px;'>
            <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
            <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Password Reset</div>
          </div>

          <div style='padding:36px 32px;'>
            <h2 style='margin:0 0 8px;font-size:20px;color:#0f172a;font-weight:700;'>Reset your password</h2>
            <p style='margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;'>
              Hi {$name}, we received a request to reset the password for your FinHub account.
              Click the button below to choose a new password.
              This link expires in <strong style='color:#0f172a;'>1 hour</strong>.
            </p>

            <div style='text-align:center;margin-bottom:28px;'>
              <a href='{$url}'
                 style='display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                        font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;
                        letter-spacing:0.01em;'>
                Reset Password
              </a>
            </div>

            <p style='margin:0 0 16px;color:#94a3b8;font-size:12px;line-height:1.6;'>
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style='margin:0 0 24px;font-size:11px;color:#64748b;word-break:break-all;
                      background:#f8fafc;padding:10px 14px;border-radius:6px;'>
              {$url}
            </p>

            <p style='margin:0;color:#94a3b8;font-size:12px;line-height:1.6;'>
              If you did not request a password reset, you can safely ignore this email —
              your password will not be changed.
            </p>
          </div>

          <div style='padding:14px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;'>
            <p style='color:#94a3b8;font-size:11px;margin:0;'>Sent from FinHub · noreply@finhubapp.app</p>
          </div>

        </div>
      </body>
    </html>";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Password reset confirmation — sent immediately after a successful reset.
  // Serves as a security notification so the user knows their password changed.
  // ─────────────────────────────────────────────────────────────────────────────
  public static function passwordResetConfirmation(string $firstName, ?string $whenUtc = null, string $userTimezone = 'UTC'): string {
    $name = htmlspecialchars($firstName);
    // When a UTC timestamp is provided, convert it to the user's timezone for display.
    if ($whenUtc) {
      try {
        $dt = DateTime::createFromFormat('Y-m-d H:i:s', $whenUtc, new DateTimeZone('UTC'));
        if ($dt === false) {
          $time = htmlspecialchars($whenUtc);
        } else {
          // Validate timezone identifier and fall back to UTC if invalid.
          if (!in_array($userTimezone, DateTimeZone::listIdentifiers(), true)) {
            $userTimezone = 'UTC';
          }
          $dt->setTimezone(new DateTimeZone($userTimezone));
          $time = $dt->format('F j, Y \a\t g:i A');
        }
      } catch (Exception $e) {
        $time = date('F j, Y \a\t g:i A');
      }
    } else {
      $time = date('F j, Y \a\t g:i A');
    }

    return "
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width'>
      </head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
        <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>

          <div style='background:#16a34a;padding:28px 32px;'>
            <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
            <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Security Notice</div>
          </div>

          <div style='padding:36px 32px;'>
            <h2 style='margin:0 0 8px;font-size:20px;color:#0f172a;font-weight:700;'>Password changed</h2>
            <p style='margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;'>
              Hi {$name}, the password for your FinHub account was successfully changed on
              <strong style='color:#0f172a;'>{$time}</strong>.
            </p>

            <div style='background:#fef2f2;border-radius:8px;padding:16px 20px;margin-bottom:24px;'>
              <p style='margin:0;color:#b91c1c;font-size:13px;line-height:1.6;'>
                <strong>Didn't make this change?</strong><br>
                If you did not reset your password, your account may be compromised.
                Please contact support immediately at
                <a href='mailto:support@finhubapp.app' style='color:#b91c1c;'>support@finhubapp.app</a>.
              </p>
            </div>

            <p style='margin:0;color:#94a3b8;font-size:12px;line-height:1.6;'>
              For security, you have been signed out of all active sessions.
              Please sign in again with your new password.
            </p>
          </div>

          <div style='padding:14px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;'>
            <p style='color:#94a3b8;font-size:11px;margin:0;'>Sent from FinHub · noreply@finhubapp.app</p>
          </div>

        </div>
      </body>
    </html>";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Application approved — sent when admin approves; includes temp password.
  // ─────────────────────────────────────────────────────────────────────────────
  public static function applicationApproved(string $firstName, string $email, string $tempPassword): string {
    $name  = htmlspecialchars($firstName);
    $em    = htmlspecialchars($email);
    $pw    = htmlspecialchars($tempPassword);

    return "
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width'>
      </head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
        <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>

          <div style='background:#16a34a;padding:28px 32px;'>
            <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
            <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Consultant Network</div>
          </div>

          <div style='padding:36px 32px;'>
            <h2 style='margin:0 0 8px;font-size:20px;color:#0f172a;font-weight:700;'>Welcome aboard, {$name}!</h2>
            <p style='margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;'>
              Your application to join the FinHub Consultant Network has been <strong style='color:#16a34a;'>approved</strong>.
              Your consultant account is now active. Use the credentials below to sign in for the first time.
            </p>

            <div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin-bottom:24px;'>
              <table cellpadding='0' cellspacing='0' width='100%'>
                <tr>
                  <td style='color:#64748b;font-size:13px;padding-bottom:10px;width:40%;'>Email</td>
                  <td style='color:#0f172a;font-size:13px;font-weight:600;padding-bottom:10px;'>{$em}</td>
                </tr>
                <tr>
                  <td style='color:#64748b;font-size:13px;'>Temporary password</td>
                  <td style='color:#0f172a;font-size:13px;font-weight:700;letter-spacing:0.05em;'>{$pw}</td>
                </tr>
              </table>
            </div>

            <div style='background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:24px;'>
              <p style='margin:0;color:#92400e;font-size:12px;line-height:1.6;'>
                <strong>Important:</strong> You will be prompted to set a new password on your first login. Please change it immediately.
              </p>
            </div>

            <p style='margin:0;color:#94a3b8;font-size:12px;line-height:1.6;'>
              Questions? Reach us at <a href='mailto:support@finhubapp.app' style='color:#16a34a;'>support@finhubapp.app</a>.
            </p>
          </div>

          <div style='padding:14px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;'>
            <p style='color:#94a3b8;font-size:11px;margin:0;'>Sent from FinHub · noreply@finhubapp.app</p>
          </div>

        </div>
      </body>
    </html>";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Application rejected — sent when admin rejects; includes optional note.
  // ─────────────────────────────────────────────────────────────────────────────
  public static function applicationRejected(string $firstName, ?string $adminNote = null): string {
    $name    = htmlspecialchars($firstName);
    $noteHtml = '';
    if (!empty(trim((string)$adminNote))) {
      $noteHtml = "
        <div style='background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin-bottom:24px;'>
          <p style='margin:0 0 4px;color:#b91c1c;font-size:12px;font-weight:600;'>Reviewer note</p>
          <p style='margin:0;color:#7f1d1d;font-size:13px;line-height:1.6;'>" . htmlspecialchars($adminNote) . "</p>
        </div>";
    }

    return "
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width'>
      </head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
        <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>

          <div style='background:#16a34a;padding:28px 32px;'>
            <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
            <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Consultant Network</div>
          </div>

          <div style='padding:36px 32px;'>
            <h2 style='margin:0 0 8px;font-size:20px;color:#0f172a;font-weight:700;'>Application update</h2>
            <p style='margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;'>
              Hi {$name}, thank you for your interest in joining the FinHub Consultant Network.
              After careful review, we are unable to move forward with your application at this time.
            </p>

            {$noteHtml}

            <p style='margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.6;'>
              We encourage you to reapply in the future as your experience grows.
            </p>
            <p style='margin:0;color:#94a3b8;font-size:12px;line-height:1.6;'>
              Questions? Reach us at <a href='mailto:support@finhubapp.app' style='color:#16a34a;'>support@finhubapp.app</a>.
            </p>
          </div>

          <div style='padding:14px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;'>
            <p style='color:#94a3b8;font-size:11px;margin:0;'>Sent from FinHub · noreply@finhubapp.app</p>
          </div>

        </div>
      </body>
    </html>";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // New inquiry — sent to the consultant when a user submits an inquiry.
  // ─────────────────────────────────────────────────────────────────────────────
  public static function inquiryReceived(
    string $consultantFirstName,
    string $userFirstName,
    string $userLastName,
    string $situationTag,
    string $briefSnippet
  ): string {
    $cName   = htmlspecialchars($consultantFirstName);
    $uName   = htmlspecialchars("{$userFirstName} {$userLastName}");
    $tag     = $situationTag !== '' ? htmlspecialchars($situationTag) : null;
    $snippet = $briefSnippet !== '' ? htmlspecialchars(mb_substr($briefSnippet, 0, 300)) : null;

    $tagHtml = $tag
      ? "<span style='display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;
                      font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;
                      margin-bottom:16px;'>{$tag}</span><br>"
      : '';

    $snippetHtml = $snippet
      ? "<div style='background:#f8fafc;border-left:3px solid #16a34a;border-radius:0 6px 6px 0;
                     padding:12px 16px;margin-top:16px;'>
           <p style='margin:0;color:#0f172a;font-size:13px;line-height:1.6;font-style:italic;'>&ldquo;{$snippet}&rdquo;</p>
         </div>"
      : '';

    return "
    <!DOCTYPE html>
    <html>
      <head><meta charset='UTF-8'><meta name='viewport' content='width=device-width'></head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
        <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>

          <div style='background:#16a34a;padding:28px 32px;'>
            <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
            <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Consultant Portal</div>
          </div>

          <div style='padding:36px 32px;'>
            <h2 style='margin:0 0 8px;font-size:20px;color:#0f172a;font-weight:700;'>New inquiry, {$cName}!</h2>
            <p style='margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;'>
              <strong style='color:#0f172a;'>{$uName}</strong> has sent you a consultation inquiry through FinHub.
            </p>
            {$tagHtml}
            {$snippetHtml}
            <div style='text-align:center;margin-top:24px;'>
              <a href='" . APP_URL . "/consultant/login'
                 style='display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                        font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;'>
                Open Consultant Dashboard
              </a>
            </div>
          </div>

          <div style='padding:14px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;'>
            <p style='color:#94a3b8;font-size:11px;margin:0;'>Sent from FinHub · noreply@finhubapp.app</p>
          </div>

        </div>
      </body>
    </html>";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Inquiry replied — sent to the user when a consultant replies.
  // ─────────────────────────────────────────────────────────────────────────────
  public static function inquiryReplied(
    string $userFirstName,
    string $consultantFirstName,
    string $consultantLastName,
    string $specialization,
    string $replySnippet
  ): string {
    $uName   = htmlspecialchars($userFirstName);
    $cName   = htmlspecialchars("{$consultantFirstName} {$consultantLastName}");
    $spec    = htmlspecialchars($specialization);
    $snippet = $replySnippet !== '' ? htmlspecialchars(mb_substr($replySnippet, 0, 300)) : null;

    $snippetHtml = $snippet
      ? "<div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;'>
           <p style='margin:0 0 6px;color:#15803d;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;'>Reply preview</p>
           <p style='margin:0;color:#0f172a;font-size:13px;line-height:1.6;font-style:italic;'>&ldquo;{$snippet}&rdquo;</p>
         </div>"
      : '<div style="height:16px;"></div>';

    return "
    <!DOCTYPE html>
    <html>
      <head><meta charset='UTF-8'><meta name='viewport' content='width=device-width'></head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
        <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>

          <div style='background:#16a34a;padding:28px 32px;'>
            <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
            <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Consultant Network</div>
          </div>

          <div style='padding:36px 32px;'>
            <h2 style='margin:0 0 8px;font-size:20px;color:#0f172a;font-weight:700;'>Your consultant replied!</h2>
            <p style='margin:0 0 4px;color:#64748b;font-size:14px;line-height:1.6;'>
              Hi {$uName}, <strong style='color:#0f172a;'>{$cName}</strong>
              ({$spec}) has responded to your inquiry.
            </p>
            {$snippetHtml}
            <p style='margin:0 0 20px;color:#64748b;font-size:13px;line-height:1.6;'>
              Open FinHub and go to <strong style='color:#0f172a;'>Consultants → My Inquiries</strong> to read the full reply.
            </p>
            <div style='text-align:center;'>
              <a href='" . APP_URL . "/consultants'
                 style='display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                        font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;'>
                Read Reply on FinHub
              </a>
            </div>
          </div>

          <div style='padding:14px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;'>
            <p style='color:#94a3b8;font-size:11px;margin:0;'>Sent from FinHub · noreply@finhubapp.app</p>
          </div>

        </div>
      </body>
    </html>";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Consultant application confirmation — sent to the applicant immediately
  // after a successful submission.
  // ─────────────────────────────────────────────────────────────────────────────
  public static function applicationConfirmation(string $firstName): string {
    $name = htmlspecialchars($firstName);

    return "
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width'>
      </head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
        <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>

          <div style='background:#16a34a;padding:28px 32px;'>
            <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
            <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>Consultant Network</div>
          </div>

          <div style='padding:36px 32px;'>
            <h2 style='margin:0 0 8px;font-size:20px;color:#0f172a;font-weight:700;'>Application received!</h2>
            <p style='margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;'>
              Hi {$name}, thank you for applying to join the FinHub Consultant Network.
              We've received your application and our team will review it shortly.
            </p>

            <div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px;'>
              <p style='margin:0;color:#15803d;font-size:13px;line-height:1.6;'>
                <strong>What happens next?</strong><br>
                Our team typically reviews applications within 3–5 business days.
                You will receive an email once a decision has been made.
              </p>
            </div>

            <p style='margin:0;color:#94a3b8;font-size:12px;line-height:1.6;'>
              If you have any questions, feel free to reach out at
              <a href='mailto:support@finhubapp.app' style='color:#16a34a;'>support@finhubapp.app</a>.
            </p>
          </div>

          <div style='padding:14px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;'>
            <p style='color:#94a3b8;font-size:11px;margin:0;'>Sent from FinHub · noreply@finhubapp.app</p>
          </div>

        </div>
      </body>
    </html>";
  }

  public static function contactMessage(string $name, string $email, string $message): string {
    return "
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width'>
      </head>
      <body style='margin:0;padding:32px 16px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;'>
        <div style='max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>

          <div style='background:#16a34a;padding:28px 32px;'>
            <div style='font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;'>FinHub</div>
            <div style='font-size:13px;color:#bbf7d0;margin-top:3px;'>New Contact Message</div>
          </div>

          <div style='padding:36px 32px;'>
            <h2 style='margin:0 0 20px;font-size:18px;color:#0f172a;font-weight:700;'>You have a new message</h2>

            <div style='background:#f8fafc;border-radius:10px;padding:20px 24px;margin-bottom:20px;'>
              <p style='margin:0 0 6px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;'>From</p>
              <p style='margin:0;font-size:15px;font-weight:600;color:#0f172a;'>{$name}</p>
              <p style='margin:4px 0 0;font-size:13px;color:#64748b;'>{$email}</p>
            </div>

            <div style='background:#f8fafc;border-radius:10px;padding:20px 24px;'>
              <p style='margin:0 0 12px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;'>Message</p>
              <p style='margin:0;font-size:14px;color:#1e293b;line-height:1.7;'>{$message}</p>
            </div>

            <p style='margin:24px 0 0;font-size:12px;color:#94a3b8;'>
              Reply directly to this email to respond to {$name}.
            </p>
          </div>

          <div style='padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;'>
            <p style='margin:0;font-size:12px;color:#94a3b8;'>FinHub · contact@finhubapp.app</p>
          </div>

        </div>
      </body>
    </html>";
  }

}