<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Username Reassigned</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f0f0f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 0;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1a1e3f 0%, #0a0e27 100%);
            padding: 40px 40px 30px;
            text-align: center;
        }
        .header-logo {
            font-size: 28px;
            font-weight: 800;
            color: #FFD700;
            margin: 0 0 8px;
            letter-spacing: -0.5px;
        }
        .header-subtitle {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            margin: 0;
        }
        .success-banner {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            padding: 20px 40px;
            text-align: center;
        }
        .success-icon {
            font-size: 36px;
            margin-bottom: 8px;
        }
        .success-text {
            color: #fff;
            font-size: 18px;
            font-weight: 700;
            margin: 0;
        }
        .body-content {
            padding: 40px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a1e3f;
            margin: 0 0 16px;
        }
        .text {
            font-size: 15px;
            color: #555;
            margin: 0 0 20px;
            line-height: 1.7;
        }
        .username-box {
            background: linear-gradient(135deg, #f8f7ff 0%, #eef0ff 100%);
            border: 2px solid #6366f1;
            border-radius: 12px;
            padding: 28px;
            text-align: center;
            margin: 28px 0;
        }
        .username-label {
            font-size: 12px;
            font-weight: 600;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 0 0 12px;
        }
        .username-value {
            font-size: 32px;
            font-weight: 800;
            color: #1a1e3f;
            letter-spacing: 1px;
            margin: 0;
        }
        .change-summary {
            background: #fafafa;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        .change-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
        }
        .change-row:first-child {
            border-bottom: 1px solid #eee;
        }
        .change-label {
            font-size: 13px;
            color: #888;
            font-weight: 500;
        }
        .change-value {
            font-size: 14px;
            font-weight: 600;
        }
        .old-username {
            color: #999;
            text-decoration: line-through;
        }
        .new-username {
            display: inline-block;
            background: #eef0ff;
            color: #6366f1;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 6px;
        }
        .info-box {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        .info-box p {
            font-size: 13px;
            color: #1e40af;
            margin: 0;
            line-height: 1.6;
        }
        .cta-wrapper {
            text-align: center;
            margin: 28px 0;
        }
        .cta-btn {
            display: inline-block;
            background: linear-gradient(135deg, #FFD700, #FF6B00);
            color: #0a0e27;
            font-size: 16px;
            font-weight: 700;
            padding: 14px 36px;
            border-radius: 12px;
            text-decoration: none;
        }
        .footer {
            text-align: center;
            padding: 24px 40px 32px;
            border-top: 1px solid #f0f0f0;
        }
        .footer p {
            font-size: 12px;
            color: #999;
            margin: 0 0 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <p class="header-logo">FamTree</p>
            <p class="header-subtitle">Username Update</p>
        </div>

        <div class="success-banner">
            <div class="success-icon">&#127881;</div>
            <p class="success-text">Your Username Has Been Updated!</p>
        </div>

        <div class="body-content">
            <p class="greeting">Congratulations {{ $fullName }},</p>

            <p class="text">
                Great news! Your verified username has been officially assigned to your FamTree account.
                You can now log in using your new username.
            </p>

            <div class="username-box">
                <p class="username-label">Your Official Username</p>
                <p class="username-value">{{ '@' . $newUsername }}</p>
            </div>

            <div class="change-summary">
                <div class="change-row">
                    <span class="change-label">Previous Username</span>
                    <span class="change-value old-username">{{ '@' . $oldUsername }}</span>
                </div>
                <div class="change-row">
                    <span class="change-label">New Username</span>
                    <span class="new-username">{{ '@' . $newUsername }}</span>
                </div>
            </div>

            <div class="info-box">
                <p><strong>Please note:</strong> You should now use your new username
                    <strong>{{ '@' . $newUsername }}</strong> to log in.
                    Your previous temporary username <strong>{{ '@' . $oldUsername }}</strong> is no longer active.
                    All your existing data and connections remain intact.</p>
            </div>

            <div class="cta-wrapper">
                <a href="{{ url('/') }}" class="cta-btn">Log In Now</a>
            </div>

            <p class="text">
                Thank you for verifying your identity and joining FamTree. We're excited to have you!
            </p>

            <p class="text" style="margin-bottom: 0;">
                Welcome aboard,<br>
                <strong>The FamTree Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>This email was sent because your FamTree username was updated.</p>
            <p>&copy; {{ date('Y') }} FamTree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
