export const getPrivacyPolicyHTML = (): string => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Gym Pass</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/images/webpage-icon-pack/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/webpage-icon-pack/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/webpage-icon-pack/favicon-16x16.png">
    
    <!-- Apple Touch Icon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/images/webpage-icon-pack/apple-touch-icon.png">
    
    <!-- Android Chrome Icons -->
    <link rel="icon" type="image/png" sizes="192x192" href="/images/webpage-icon-pack/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/images/webpage-icon-pack/android-chrome-512x512.png">
    
    <!-- Web App Manifest -->
    <link rel="manifest" href="/images/webpage-icon-pack/site.webmanifest">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f7;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #1d1d1f;
            margin-bottom: 10px;
            font-size: 2.5em;
            font-weight: 600;
        }
        
        .app-name {
            color: #007AFF;
            font-weight: 700;
        }
        
        .last-updated {
            color: #86868b;
            font-size: 0.9em;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e5e7;
        }
        
        h2 {
            color: #1d1d1f;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.5em;
            font-weight: 600;
        }
        
        p {
            margin-bottom: 15px;
            color: #424245;
            line-height: 1.8;
        }
        
        ul {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin-bottom: 10px;
            color: #424245;
            line-height: 1.8;
        }
        
        .highlight {
            background-color: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007AFF;
        }
        
        .contact-section {
            background-color: #f5f5f7;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e7;
            text-align: center;
            color: #86868b;
            font-size: 0.9em;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 25px;
                border-radius: 0;
            }
            
            h1 {
                font-size: 2em;
            }
            
            body {
                padding: 0;
                background-color: white;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Privacy Policy</h1>
        <div class="last-updated">Last Updated: ${currentDate}</div>
        
        <p>
            This Privacy Policy describes how the <span class="app-name">Gym Pass</span> application 
            ("we", "our", or "the app") collects, uses, and protects your information when you use 
            our service to generate and manage digital gym membership passes for Apple Wallet.
        </p>
        
        <div class="highlight">
            <strong>Your Privacy Matters</strong><br>
            We are committed to protecting your privacy. The Gym Pass app and its API service are 
            designed with privacy in mind, collecting only the minimum information necessary to 
            provide our service.
        </div>
        
        <h2>1. Information We Collect</h2>
        <p>
            When you use the Gym Pass app to create a digital membership pass, we collect only the 
            information you provide for display on your pass:
        </p>
        <ul>
            <li><strong>Member Information:</strong> Name, membership ID, and membership tier (if provided)</li>
            <li><strong>Pass Details:</strong> Gym location, membership expiration date, and any member benefits</li>
            <li><strong>Visual Preferences:</strong> Color schemes and display preferences for your pass</li>
            <li><strong>Technical Data:</strong> Basic API request information for service functionality</li>
        </ul>
        
        <h2>2. How We Use Your Information</h2>
        <p>
            The information collected is used exclusively for:
        </p>
        <ul>
            <li>Generating your digital gym membership pass</li>
            <li>Creating the pass file compatible with Apple Wallet</li>
            <li>Providing temporary download access to your generated pass</li>
        </ul>
        
        <h2>3. Data Storage and Retention</h2>
        <p>
            We prioritize minimal data retention:
        </p>
        <ul>
            <li><strong>Temporary Storage:</strong> Generated passes are stored temporarily on our servers</li>
            <li><strong>Automatic Deletion:</strong> All pass data is automatically deleted within 1 hour after generation</li>
            <li><strong>No Long-term Storage:</strong> We do not maintain databases of user information</li>
            <li><strong>No User Accounts:</strong> The service operates without requiring user registration or accounts</li>
        </ul>
        
        <h2>4. Data Sharing and Third Parties</h2>
        <p>
            <strong>We do not sell, trade, or share your personal information with third parties.</strong>
        </p>
        <ul>
            <li>No information is shared with advertisers or marketing companies</li>
            <li>No analytics or tracking services are used</li>
            <li>No third-party services have access to your pass information</li>
            <li>The service operates independently without external data processors</li>
        </ul>
        
        <h2>5. Security Measures</h2>
        <p>
            We implement appropriate security measures to protect your information:
        </p>
        <ul>
            <li>Secure HTTPS connections for all data transmission</li>
            <li>Digital signatures on all passes to ensure authenticity</li>
            <li>Temporary file systems with automatic cleanup</li>
            <li>No persistent storage of personal information</li>
        </ul>
        
        <h2>6. Apple Wallet Integration</h2>
        <p>
            Once your pass is added to Apple Wallet:
        </p>
        <ul>
            <li>The pass data is stored locally on your device by Apple Wallet</li>
            <li>We have no access to passes stored in your Apple Wallet</li>
            <li>Apple's privacy policies apply to data within Apple Wallet</li>
            <li>Pass updates or modifications require generating a new pass through the app</li>
        </ul>
        
        <h2>7. Your Rights and Choices</h2>
        <p>
            You have control over your information:
        </p>
        <ul>
            <li><strong>Minimal Data:</strong> Only provide information you want displayed on your pass</li>
            <li><strong>No Tracking:</strong> We don't track your usage or collect analytics</li>
            <li><strong>Deletion:</strong> Pass data is automatically deleted from our servers</li>
            <li><strong>Local Control:</strong> You can delete passes from Apple Wallet at any time</li>
        </ul>
        
        <h2>8. Children's Privacy</h2>
        <p>
            The Gym Pass app is not directed at children under the age of 13. We do not knowingly 
            collect personal information from children under 13. The app is intended for gym members 
            who are authorized to have membership accounts.
        </p>
        
        <h2>9. Changes to This Policy</h2>
        <p>
            We may update this Privacy Policy from time to time. Any changes will be reflected on 
            this page with an updated "Last Updated" date. Continued use of the app after changes 
            constitutes acceptance of the updated policy.
        </p>
        
        <h2>10. Data Processing Location</h2>
        <p>
            Your information is processed on secure servers with appropriate safeguards in place. 
            All data processing occurs only for the duration necessary to generate and deliver your 
            digital pass.
        </p>
       
        <div class="highlight">
            <strong>California Residents:</strong> You may have additional rights under the California 
            Consumer Privacy Act (CCPA). However, as we do not sell personal information and automatically 
            delete all data, most CCPA provisions may not apply to our minimal data practices.
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} 8Examples Inc. All rights reserved.</p>
            <p>This privacy policy is effective as of ${currentDate}</p>
        </div>
    </div>
</body>
</html>`;
};