<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We Miss You!</title>
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
        }
        .content {
            margin-bottom: 30px;
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
            <h1>We Miss You on FamTree!</h1>
        </div>

        <div class="content">
            <p>Hi {{ $userName }},</p>

            <p>It's been a while since we've seen you on FamTree, and we wanted to reach out to let you know that your family tree and connections are waiting for you!</p>

            <p>Your family story matters, and there may be new updates, connections, or memories waiting for you to discover.</p>

            <p>We'd love to have you back. Click the button below to log in and reconnect with your family:</p>
        </div>

        <div class="button-container">
            <a href="{{ $loginUrl }}" class="cta-button">Log In to FamTree</a>
        </div>

        <div class="content">
            <p>If you have any questions or need help accessing your account, please don't hesitate to reach out to our support team.</p>

            <p>Warm regards,<br>The FamTree Team</p>
        </div>

        <div class="footer">
            <p>You're receiving this email because you have an account on FamTree.</p>
            <p>&copy; {{ date('Y') }} FamTree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
