<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Family Status Check</title>
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
        .sensitive-notice {
            background-color: #f8f4e8;
            border-left: 4px solid #d4a574;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
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
            <h1>A Gentle Check-In</h1>
        </div>

        <div class="content">
            <p>Hi {{ $familyMemberName }},</p>

            <p>We hope this message finds you well. We're reaching out because we've noticed that <strong>{{ $inactiveUserName }}</strong> hasn't been active on FamTree for quite some time.</p>

            <div class="sensitive-notice">
                <p><strong>We understand this might be a sensitive topic.</strong></p>
                <p>As a close family member, we wanted to gently check in with you to understand if everything is okay with {{ $inactiveUserName }}.</p>
            </div>

            <p>Your response will help us ensure that {{ $inactiveUserName }}'s account is handled appropriately and with care.</p>
        </div>

        <div class="button-container">
            <a href="{{ $responseUrl }}" class="cta-button">Respond to This Check</a>
        </div>

        <div class="content">
            <p>If you're not comfortable responding or prefer not to participate, that's completely okay. We respect your decision.</p>

            <p>Thank you for your time and understanding.</p>

            <p>With care,<br>The FamTree Team</p>
        </div>

        <div class="footer">
            <p>This email was sent because you're listed as a close family member of {{ $inactiveUserName }} on FamTree.</p>
            <p>&copy; {{ date('Y') }} FamTree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
