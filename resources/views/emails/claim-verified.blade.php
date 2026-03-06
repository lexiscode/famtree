<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claim Verified</title>
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
        .username-badge {
            display: inline-block;
            background: #eef0ff;
            color: #6366f1;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 15px;
        }
        .temp-username-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 15px;
        }
        .steps-section {
            background: #fafafa;
            border-radius: 12px;
            padding: 24px;
            margin: 28px 0;
        }
        .steps-title {
            font-size: 15px;
            font-weight: 700;
            color: #1a1e3f;
            margin: 0 0 16px;
        }
        .step {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 14px;
        }
        .step:last-child {
            margin-bottom: 0;
        }
        .step-num {
            width: 24px;
            height: 24px;
            background: #6366f1;
            color: #fff;
            border-radius: 50%;
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            line-height: 24px;
            flex-shrink: 0;
        }
        .step-text {
            font-size: 14px;
            color: #555;
            margin: 0;
            line-height: 1.5;
            padding-top: 2px;
        }
        .highlight-box {
            background: linear-gradient(135deg, #f8f7ff 0%, #eef0ff 100%);
            border: 2px solid #6366f1;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 28px 0;
        }
        .highlight-label {
            font-size: 12px;
            font-weight: 600;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 0 0 10px;
        }
        .highlight-value {
            font-size: 26px;
            font-weight: 800;
            color: #1a1e3f;
            letter-spacing: 1px;
            margin: 0;
            font-family: 'Courier New', monospace;
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
        .warning-box {
            background-color: #fff8e1;
            border-left: 4px solid #ffa000;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-box p {
            font-size: 13px;
            color: #7a6200;
            margin: 0;
            line-height: 1.6;
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
            margin: 8px 0 20px;
        }
        .cta-wrapper {
            text-align: center;
            margin: 28px 0;
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
        .footer a {
            color: #6366f1;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <p class="header-logo">FamTree</p>
            <p class="header-subtitle">Username Claim Verified</p>
        </div>

        <div class="success-banner">
            <div class="success-icon">&#10003;</div>
            <p class="success-text">Your Identity Has Been Verified!</p>
        </div>

        <div class="body-content">
            <p class="greeting">Congratulations {{ $fullName }},</p>

            <p class="text">
                Great news! Your claim request for the reserved username
                <span class="username-badge">{{ '@' . $username }}</span> on FamTree has been
                <strong>successfully verified</strong>. We've confirmed your identity and you're now one step away
                from getting your official username.
            </p>

            <div class="steps-section">
                <p class="steps-title">Here's what to do next:</p>
                <div class="step">
                    <span class="step-num">1</span>
                    <p class="step-text">
                        Create a new FamTree account using the temporary username below.
                        Use the same email address you used for this claim request (<strong>{{ $fullName }}</strong>).
                    </p>
                </div>
                <div class="step">
                    <span class="step-num">2</span>
                    <p class="step-text">
                        Once your account is created, our team will automatically reassign the reserved username
                        <strong>{{ '@' . $username }}</strong> to your account.
                    </p>
                </div>
                <div class="step">
                    <span class="step-num">3</span>
                    <p class="step-text">
                        You'll then be able to log in and use FamTree with your official verified username.
                    </p>
                </div>
            </div>

            <div class="highlight-box">
                <p class="highlight-label">Register With This Temporary Username</p>
                <p class="highlight-value">{{ $tempUsername }}</p>
            </div>

            <div class="cta-wrapper">
                <a href="{{ url('/') }}" class="cta-btn">Create Your Account</a>
            </div>

            <div class="info-box">
                <p><strong>Why a temporary username?</strong> Since your reserved username
                    <strong>{{ '@' . $username }}</strong> is currently protected, you'll first register with a temporary
                    username. Once registered, our team will update your account to use
                    <strong>{{ '@' . $username }}</strong> — no action needed from you after registration.</p>
            </div>

            <div class="warning-box">
                <p><strong>Important:</strong> Please register using the exact temporary username shown above
                    (<strong>{{ $tempUsername }}</strong>) so our team can identify and update your account.
                    Use the same email address associated with this claim request.</p>
            </div>

            <p class="text">
                If you have any questions or need assistance, feel free to reach out to our support team.
            </p>

            <p class="text" style="margin-bottom: 0;">
                Welcome to FamTree,<br>
                <strong>The FamTree Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>This email was sent because your username claim request on FamTree was verified.</p>
            <p>If you didn't make this request, please ignore this email.</p>
            <p>&copy; {{ date('Y') }} FamTree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
