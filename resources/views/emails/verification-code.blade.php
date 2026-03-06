<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Username Verification Code</title>
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
        .code-box {
            background: linear-gradient(135deg, #f8f7ff 0%, #eef0ff 100%);
            border: 2px solid #6366f1;
            border-radius: 12px;
            padding: 28px;
            text-align: center;
            margin: 28px 0;
        }
        .code-label {
            font-size: 12px;
            font-weight: 600;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 0 0 12px;
        }
        .code-value {
            font-size: 32px;
            font-weight: 800;
            color: #1a1e3f;
            letter-spacing: 3px;
            margin: 0;
            font-family: 'Courier New', monospace;
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
            <p class="header-subtitle">Username Verification</p>
        </div>

        <div class="body-content">
            <p class="greeting">Hello {{ $fullName }},</p>

            <p class="text">
                Thank you for submitting a claim request for the reserved username
                <span class="username-badge">{{ '@' . $username }}</span> on FamTree.
                We've reviewed your request and generated a verification code for you.
            </p>

            <div class="code-box">
                <p class="code-label">Your Verification Code</p>
                <p class="code-value">{{ $verificationCode }}</p>
            </div>

            <div class="steps-section">
                <p class="steps-title">What to do next:</p>
                <div class="step">
                    <span class="step-num">1</span>
                    <p class="step-text">Copy the verification code above.</p>
                </div>
                <div class="step">
                    <span class="step-num">2</span>
                    <p class="step-text">Post the code on your verified social media profile (the one you provided: <a href="{{ $socialMediaUrl }}" style="color: #6366f1;">{{ $socialMediaUrl }}</a>). You can post it as a story, tweet, or regular post.</p>
                </div>
                <div class="step">
                    <span class="step-num">3</span>
                    <p class="step-text">Once posted, our team will verify the code on your profile and assign the username <strong>{{ '@' . $username }}</strong> to your FamTree account.</p>
                </div>
            </div>

            <div class="warning-box">
                <p><strong>Important:</strong> Please keep the post visible for at least 24 hours so our team can verify it. Do not share this code with anyone else.</p>
            </div>

            <p class="text">
                If you have any questions or need assistance, feel free to reach out to our support team.
            </p>

            <p class="text" style="margin-bottom: 0;">
                Best regards,<br>
                <strong>The FamTree Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>This email was sent because you submitted a username claim request on FamTree.</p>
            <p>If you didn't make this request, please ignore this email.</p>
            <p>&copy; {{ date('Y') }} FamTree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
