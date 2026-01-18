<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memorial Created</title>
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
            color: #5a4a6a;
            margin: 0;
            font-size: 24px;
        }
        .memorial-icon {
            font-size: 48px;
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .memorial-box {
            background: linear-gradient(135deg, #f8f4fa 0%, #efe8f2 100%);
            border: 1px solid #d4c4de;
            padding: 25px;
            margin: 20px 0;
            border-radius: 10px;
            text-align: center;
        }
        .memorial-box h2 {
            color: #5a4a6a;
            margin: 0 0 10px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #7a6a8a;
            color: #ffffff;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #6a5a7a;
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
        <div class="memorial-icon">
            🕯️
        </div>

        <div class="header">
            <h1>In Loving Memory</h1>
        </div>

        <div class="content">
            <p>Dear {{ $familyMemberName }},</p>

            <p>We wanted to let you know that a memorial page has been created for <strong>{{ $deceasedName }}</strong> on FamTree.</p>

            <div class="memorial-box">
                <h2>{{ $deceasedName }}</h2>
                <p>Their memory lives on through the stories and connections shared on FamTree.</p>
            </div>
        </div>

        <div class="info-section">
            <p><strong>As a close family member, you can:</strong></p>
            <ul>
                <li>Visit the memorial page to see their profile and family connections</li>
                <li>Leave tribute messages and memories</li>
                <li>Share stories and photos in their honor</li>
            </ul>
        </div>

        <div class="button-container">
            <a href="{{ $memorialUrl }}" class="cta-button">Visit Memorial Page</a>
        </div>

        <div class="content">
            <p>We understand this is a difficult time. FamTree is here to help preserve and celebrate the memory of your loved one.</p>

            <p>With deepest sympathy,<br>The FamTree Team</p>
        </div>

        <div class="footer">
            <p>This email was sent because you're listed as a close family member of {{ $deceasedName }} on FamTree.</p>
            <p>&copy; {{ date('Y') }} FamTree. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
