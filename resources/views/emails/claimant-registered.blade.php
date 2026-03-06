<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claimant Registered</title>
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
        .alert-banner {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            padding: 18px 40px;
            text-align: center;
        }
        .alert-icon {
            font-size: 28px;
            margin-bottom: 4px;
        }
        .alert-text {
            color: #fff;
            font-size: 16px;
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
        .details-box {
            background: #fafafa;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        .details-title {
            font-size: 14px;
            font-weight: 700;
            color: #1a1e3f;
            margin: 0 0 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-size: 13px;
            color: #888;
            font-weight: 500;
        }
        .detail-value {
            font-size: 14px;
            color: #1a1e3f;
            font-weight: 600;
        }
        .username-badge {
            display: inline-block;
            background: #eef0ff;
            color: #6366f1;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 14px;
        }
        .temp-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 14px;
        }
        .action-box {
            background: linear-gradient(135deg, #f8f7ff 0%, #eef0ff 100%);
            border: 2px solid #6366f1;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 28px 0;
        }
        .action-label {
            font-size: 12px;
            font-weight: 600;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 0 0 10px;
        }
        .action-text {
            font-size: 15px;
            color: #1a1e3f;
            font-weight: 600;
            margin: 0 0 16px;
            line-height: 1.6;
        }
        .cta-btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #ffffff;
            font-size: 15px;
            font-weight: 700;
            padding: 12px 32px;
            border-radius: 10px;
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
            <p class="header-subtitle">Admin Notification</p>
        </div>

        <div class="alert-banner">
            <div class="alert-icon">&#9888;</div>
            <p class="alert-text">Action Required: Username Reassignment</p>
        </div>

        <div class="body-content">
            <p class="greeting">Hello Admin,</p>

            <p class="text">
                A verified claimant has just created their FamTree account using the temporary username
                that was assigned to them. The account is now ready for username reassignment.
            </p>

            <div class="details-box">
                <p class="details-title">Claimant Details</p>
                <div class="detail-row">
                    <span class="detail-label">Claimant Name</span>
                    <span class="detail-value">{{ $claimantName }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">{{ $claimantEmail }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Temporary Username</span>
                    <span class="temp-badge">{{ $tempUsername }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Reserved Username</span>
                    <span class="username-badge">{{ '@' . $reservedUsername }}</span>
                </div>
            </div>

            <div class="action-box">
                <p class="action-label">Next Step</p>
                <p class="action-text">
                    Go to the Reserved Usernames page and reassign
                    <span class="username-badge">{{ '@' . $reservedUsername }}</span>
                    to the user currently registered as
                    <span class="temp-badge">{{ $tempUsername }}</span>.
                </p>
                <a href="{{ url('/admin/reserved-usernames') }}" class="cta-btn">Go to Reserved Usernames</a>
            </div>

            <p class="text" style="margin-bottom: 0;">
                Best regards,<br>
                <strong>FamTree System</strong>
            </p>
        </div>

        <div class="footer">
            <p>This is an automated notification from FamTree.</p>
            <p>&copy; {{ date('Y') }} FamTree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
