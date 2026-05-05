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

  public static function reminder(array $r): string {
    $name    = htmlspecialchars($r['bill_name']);
    $amount  = htmlspecialchars($r['currency_symbol'] . number_format((float)$r['amount'], 2));
    $due     = htmlspecialchars(date('F j, Y', strtotime($r['due_date'])));
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

  public static function weeklySummary(array $user, array $allBills, array $upcoming): string {
    $firstName   = htmlspecialchars($user['first_name']);
    $date        = date('F j, Y');
    $totalBills  = count($allBills);
    $unpaidCount = count(array_filter($allBills, fn($b) => !$b['is_paid']));

    $rows = '';
    if (count($upcoming) > 0) {
        foreach ($upcoming as $b) {
            $bName   = htmlspecialchars($b['name']);
            $bAmount = htmlspecialchars($b['currency_symbol'] . number_format((float)$b['amount'], 2));
            $bDue    = htmlspecialchars(date('M j', strtotime($b['due_date'])));
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
}