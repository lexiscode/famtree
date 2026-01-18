<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reactivate Your Account</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2d5a27;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .verification-box {
            background-color: #e8f5e9;
            border: 2px solid #4caf50;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
        }
        .cta-button {
            display: inline-block;
            background-color: #4a9d4a;
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #3d8a3d;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .warning-box {
            background-color: #fff8e1;
            border-left: 4px solid #ffa000;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Identity</h1>
        </div>

        <div class="content">
            <p>Hi {{ $userName }},</p>

            <p>We received a request to reactivate your FamTree account. To confirm this is really you, please click the verification button below.</p>

            <div class="verification-box">
                <p><strong>Click below to reactivate your account and restore full access.</strong></p>
            </div>
        </div>

        <div class="button-container">
            <a href="{{ $reactivationUrl }}" class="cta-button">Reactivate My Account</a>
        </div>

        <div class="warning-box">
            <p><strong>Important:</strong></p>
            <ul>
                <li>This link will expire in {{ $expiryHours }} hours</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this link with anyone</li>
            </ul>
        </div>

        <div class="content">
            <p>Once verified, your account will be fully restored and you'll be able to:</p>
            <ul>
                <li>Access your profile and family tree</li>
                <li>Connect with family members</li>
                <li>Send and receive messages</li>
            </ul>

            <p>Welcome back!</p>

            <p>Best regards,<br>The FamTree Team</p>
        </div>

        <div class="footer">
            <p>This email was sent because a reactivation was requested for your FamTree account.</p>
            <p>If you didn't make this request, no action is needed. Your account will remain as is.</p>
            <p>&copy; {{ date('Y') }} FamTree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
