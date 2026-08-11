export function getSupportPageHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gym Pass Support</title>
    
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 50px;
        }
        
        h1 {
            color: white;
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.2rem;
            font-weight: 300;
        }
        
        .device-section {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .device-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .device-icon {
            width: 50px;
            height: 50px;
            margin-right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }
        
        h2 {
            color: #333;
            font-size: 1.8rem;
            font-weight: 600;
        }
        
        .screenshots-grid {
            display: grid;
            gap: 30px;
            margin-top: 30px;
        }
        
        .iphone-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .watch-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        
        .screenshot-item {
            position: relative;
            overflow: hidden;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
        }
        
        .screenshot-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        }
        
        .screenshot-item img {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .screenshot-label {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
            color: white;
            padding: 20px 15px 15px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .features-section {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        
        .feature-item {
            text-align: center;
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
        }
        
        .feature-title {
            color: #333;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .feature-description {
            color: #666;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        .instructions-section {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .instructions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        
        .instruction-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 15px;
            padding: 30px;
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .instruction-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }
        
        .instruction-card.iphone {
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            border: 2px solid #667eea30;
        }
        
        .instruction-card.watch {
            background: linear-gradient(135deg, #f09315 0%, #ed1e7915 100%);
            border: 2px solid #f0931530;
        }
        
        .instruction-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .instruction-icon {
            width: 40px;
            height: 40px;
            margin-right: 15px;
            background: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .instruction-title {
            color: #333;
            font-size: 1.3rem;
            font-weight: 600;
        }
        
        .instruction-steps {
            list-style: none;
            padding: 0;
            margin: 20px 0;
        }
        
        .instruction-steps li {
            position: relative;
            padding-left: 35px;
            margin-bottom: 15px;
            color: #555;
            line-height: 1.6;
        }
        
        .instruction-steps li:before {
            content: attr(data-step);
            position: absolute;
            left: 0;
            top: 0;
            width: 25px;
            height: 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            color: white;
            font-size: 0.85rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .instruction-tip {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 15px;
            margin-top: 15px;
            border-radius: 5px;
            font-size: 0.9rem;
            color: #92400e;
        }
        
        .instruction-tip strong {
            color: #78350f;
        }
        
        .method-divider {
            text-align: center;
            margin: 15px 0;
            color: #999;
            font-size: 0.85rem;
            position: relative;
        }
        
        .method-divider:before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            height: 1px;
            background: #e0e0e0;
        }
        
        .method-divider span {
            background: white;
            padding: 0 15px;
            position: relative;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
            animation: fadeIn 0.3s;
        }
        
        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            max-width: 90%;
            max-height: 90%;
            position: relative;
        }
        
        .modal-content img {
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 90vh;
            border-radius: 10px;
        }
        
        .close {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 35px;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s;
        }
        
        .close:hover {
            color: #f0f0f0;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            
            .subtitle {
                font-size: 1rem;
            }
            
            .device-section, .features-section {
                padding: 25px;
            }
            
            .screenshots-grid {
                gap: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Gym Pass Support</h1>
            <p class="subtitle">Your Digital Gym Membership in Apple Wallet</p>
        </header>
        
        <div class="features-section">
            <h2 style="text-align: center; margin-bottom: 10px;">Key Features</h2>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">📱</div>
                    <div class="feature-title">Quick Access</div>
                    <div class="feature-description">Access your gym pass instantly from Apple Wallet, even when offline</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">⌚</div>
                    <div class="feature-title">Apple Watch Support</div>
                    <div class="feature-description">Show your pass directly from your Apple Watch for hands-free entry</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🔄</div>
                    <div class="feature-title">Auto Updates</div>
                    <div class="feature-description">Your pass updates automatically when your membership changes</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🔒</div>
                    <div class="feature-title">Secure</div>
                    <div class="feature-description">Protected by your device's security features and encryption</div>
                </div>
            </div>
        </div>
        
        <div class="instructions-section">
            <h2 style="text-align: center; margin-bottom: 10px;">How to Access Your Gym Pass</h2>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">Apple Wallet is built into every iPhone and Apple Watch. Here's how to quickly access your pass at the gym:</p>
            
            <div class="instructions-grid">
                <div class="instruction-card iphone">
                    <div class="instruction-header">
                        <div class="instruction-icon">📱</div>
                        <h3 class="instruction-title">On iPhone</h3>
                    </div>
                    
                    <p style="font-weight: 600; color: #444; margin-bottom: 15px;">Fastest Method:</p>
                    <ul class="instruction-steps">
                        <li data-step="1">Double-click the Side Button (iPhone X or later) or Home Button (iPhone 8 or earlier)</li>
                        <li data-step="2">Your Gym Pass will appear on screen</li>
                        <li data-step="3">Hold your phone near the scanner at the gym front desk</li>
                    </ul>
                    
                    <div class="method-divider"><span>OR</span></div>
                    
                    <p style="font-weight: 600; color: #444; margin-bottom: 15px;">From Wallet App:</p>
                    <ul class="instruction-steps">
                        <li data-step="1">Open the Wallet app (it's pre-installed on all iPhones)</li>
                        <li data-step="2">Tap on your Gym Pass</li>
                        <li data-step="3">Show the QR code to the scanner</li>
                    </ul>
                    
                    <div class="instruction-tip">
                        <strong>Pro Tip:</strong> You can also say "Hey Siri, open my gym pass" to access it hands-free!
                    </div>
                </div>
                
                <div class="instruction-card watch">
                    <div class="instruction-header">
                        <div class="instruction-icon">⌚</div>
                        <h3 class="instruction-title">On Apple Watch</h3>
                    </div>
                    
                    <p style="font-weight: 600; color: #444; margin-bottom: 15px;">Quick Access:</p>
                    <ul class="instruction-steps">
                        <li data-step="1">Double-click the Side Button below the Digital Crown</li>
                        <li data-step="2">Swipe to find your Gym Pass</li>
                        <li data-step="3">Hold your wrist near the scanner</li>
                    </ul>
                    
                    <div class="method-divider"><span>OR</span></div>
                    
                    <p style="font-weight: 600; color: #444; margin-bottom: 15px;">From Wallet App:</p>
                    <ul class="instruction-steps">
                        <li data-step="1">Press the Digital Crown to see all apps</li>
                        <li data-step="2">Tap the Wallet app icon</li>
                        <li data-step="3">Select your Gym Pass and present to scanner</li>
                    </ul>
                    
                    <div class="instruction-tip">
                        <strong>Pro Tip:</strong> Your pass may automatically appear when you arrive at the gym if location services are enabled!
                    </div>
                </div>
            </div>
            
            <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 10px; padding: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #0c4a6e; font-size: 1.1rem; margin: 0;">
                    <strong>No App Download Needed!</strong> Apple Wallet is already on your device. Just add your pass and you're ready to go.
                </p>
            </div>
        </div>
        
        <div class="device-section">
            <div class="device-header">
                <div class="device-icon">📱</div>
                <h2>iPhone Screenshots</h2>
            </div>
            <div class="screenshots-grid iphone-grid">
                <div class="screenshot-item" onclick="openModal('/images/iphone16pro/iPhone_16_a.png')">
                    <img src="/images/iphone16pro/iPhone_16_a.png" alt="iPhone Screenshot 1">
                    <div class="screenshot-label">Pass Overview</div>
                </div>
                <div class="screenshot-item" onclick="openModal('/images/iphone16pro/iPhone_16_b.png')">
                    <img src="/images/iphone16pro/iPhone_16_b.png" alt="iPhone Screenshot 2">
                    <div class="screenshot-label">Membership Details</div>
                </div>
                <div class="screenshot-item" onclick="openModal('/images/iphone16pro/iPhone_16_c.png')">
                    <img src="/images/iphone16pro/iPhone_16_c.png" alt="iPhone Screenshot 3">
                    <div class="screenshot-label">QR Code Scanner</div>
                </div>
            </div>
        </div>
        
        <div class="device-section">
            <div class="device-header">
                <div class="device-icon">⌚</div>
                <h2>Apple Watch Screenshots</h2>
            </div>
            <div class="screenshots-grid watch-grid">
                <div class="screenshot-item" onclick="openModal('/images/watch8_45mm/watch8_45mm_wallet.PNG')">
                    <img src="/images/watch8_45mm/watch8_45mm_wallet.PNG" alt="Watch Wallet View">
                    <div class="screenshot-label">Wallet View</div>
                </div>
                <div class="screenshot-item" onclick="openModal('/images/watch8_45mm/watch8_45mm_qrcode.PNG')">
                    <img src="/images/watch8_45mm/watch8_45mm_qrcode.PNG" alt="Watch QR Code">
                    <div class="screenshot-label">QR Code Display</div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="imageModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <img id="modalImage" src="" alt="Full size screenshot">
        </div>
    </div>
    
    <script>
        function openModal(imageSrc) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modal.classList.add('active');
            modalImg.src = imageSrc;
        }
        
        function closeModal() {
            const modal = document.getElementById('imageModal');
            modal.classList.remove('active');
        }
        
        // Close modal when clicking outside the image
        document.getElementById('imageModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Close modal with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    </script>
</body>
</html>`;
}