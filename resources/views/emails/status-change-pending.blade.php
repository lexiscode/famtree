<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Important Account Notice</title>
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
            color: #c44;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .alert-box {
            background-color: #fff3f3;
            border: 2px solid #e57373;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
        }
        .alert-box h2 {
            color: #c44;
            margin: 0 0 10px 0;
        }
        .days-remaining {
            font-size: 36px;
            font-weight: bold;
            color: #c44;
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
        .info-section {
            background-color: #f8f8f8;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
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
            <h1>Important Account Notice</h1>
        </div>

        <div class="content">
            <p>Hi {{ $userName }},</p>

            <p>We're reaching out with an important message about your FamTree account.</p>

            <div class="alert-box">
                <h2>Your Account Status is Scheduled to Change</h2>
                <p>Based on extended inactivity and feedback from family members, your account is scheduled to be converted to a memorial profile on:</p>
                <p><strong>{{ $scheduledDate }}</strong></p>
                @if($daysRemaining > 0)
                    <p class="days-remaining">{{ $daysRemaining }} days remaining</p>
                @endif
            </div>

            <p><strong>If this is a mistake, please log in immediately to cancel this action.</strong></p>

            <p>Simply logging into your account will automatically cancel the scheduled status change and confirm that you're still with us.</p>
        </div>

        <div class="button-container">
            <a href="{{ $loginUrl }}" class="cta-button">Log In Now to Cancel</a>
        </div>

        <div class="info-section">
            <p><strong>What happens if I don't log in?</strong></p>
            <p>On {{ $scheduledDate }}, your profile will be converted to a memorial page. This means:</p>
            <ul>
                <li>Your profile will display a memorial banner</li>
                <li>Family members can leave tribute messages</li>
                <li>Interactive features (messaging, connections) will be disabled</li>
            </ul>
            <p>You can always reactivate your account later through email verification if needed.</p>
        </div>

        <div class="content">
            <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>

            <p>Sincerely,<br>The FamTree Team</p>
        </div>

        <div class="footer">
            <p>This is an automated message regarding your FamTree account status.</p>
            <p>&copy; {{ date('Y') }} FamTree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
