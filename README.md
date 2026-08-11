# Apple Wallet Pass API Service

A REST API service for generating Apple Wallet passes (.pkpass files) that can be added to Apple Wallet on iOS devices.

## Features

- Generate Apple Wallet passes dynamically via REST API
- Custom pass generation without third-party libraries
- PKCS#7 signing with Apple certificates
- Support for various pass types (generic, boarding pass, coupon, etc.)
- API key authentication
- Rate limiting
- Automatic cleanup of expired passes

## Prerequisites

- Node.js v18 or higher
- Apple Developer Account
- Pass Type ID and certificates from Apple Developer Portal

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Create the required certificates and place them in the `certificates/` directory (see [Certificate Setup](#certificate-setup)):
   - `pass-cert.p12` - Your Pass Type ID certificate (with private key)
   - `wwdr.pem` - Apple WWDR G4 intermediate certificate

5. Add pass images to `assets/pass-templates/generic/`:
   - `icon.png`, `icon@2x.png`, `icon@3x.png` (required)
   - `logo.png`, `logo@2x.png` (optional)

## Configuration

Edit `.env` file with your settings:

```env
# Server
PORT=3000
NODE_ENV=development

# API
API_KEYS=your_api_key_1,your_api_key_2

# Apple Developer
PASS_TYPE_ID=pass.com.yourcompany.generic
TEAM_ID=ABCDEF1234
CERT_PATH=./certificates/pass-cert.p12
CERT_PASSWORD=your_certificate_password
WWDR_PATH=./certificates/wwdr.pem
```

## Certificate Setup

The service signs passes with two certificates, both placed in the `certificates/` directory. Neither is included in this repository, and they must never be committed (the `.gitignore` excludes them).

| File | What it is | Where it comes from |
|------|------------|---------------------|
| `certificates/pass-cert.p12` | Your Pass Type ID certificate bundled with its private key, protected by a password | Apple Developer Portal (requires a paid Apple Developer account) |
| `certificates/wwdr.pem` | Apple Worldwide Developer Relations (WWDR) G4 intermediate certificate, PEM format | Apple's public certificate authority page |

The file names above are the defaults; you can use different paths by setting `CERT_PATH` and `WWDR_PATH` in `.env`.

### 1. Create a Pass Type ID

1. Sign in to the [Apple Developer Portal](https://developer.apple.com/account) and open **Certificates, Identifiers & Profiles → Identifiers**.
2. Click **+**, choose **Pass Type IDs**, and register an identifier such as `pass.com.yourcompany.generic`.
3. Use this identifier as `PASS_TYPE_ID` in `.env`, and your Team ID (visible under Membership details) as `TEAM_ID`.

### 2. Create a Certificate Signing Request (CSR)

**On macOS:** open Keychain Access → **Certificate Assistant → Request a Certificate From a Certificate Authority**, enter your email, select "Saved to disk", and save the `.certSigningRequest` file.

**On any platform with OpenSSL:**
```bash
openssl genrsa -out pass-key.pem 2048
openssl req -new -key pass-key.pem -out pass.certSigningRequest \
  -subj "/emailAddress=you@example.com/CN=Pass Certificate/C=US"
```
Keep `pass-key.pem` — you need it in step 4.

### 3. Issue the Pass Type ID certificate

1. In the portal, go to **Certificates**, click **+**, and select **Pass Type ID Certificate**.
2. Choose the Pass Type ID from step 1, upload your CSR, and download the resulting `pass.cer`.

### 4. Export as `pass-cert.p12`

**If you created the CSR with Keychain Access:** double-click `pass.cer` to import it, find it in Keychain Access (it will show your private key nested under it), right-click and **Export** as a `.p12` file with a password. Save it as `certificates/pass-cert.p12`.

**If you created the CSR with OpenSSL:**
```bash
openssl x509 -inform DER -in pass.cer -out pass-cert.pem
openssl pkcs12 -export -inkey pass-key.pem -in pass-cert.pem \
  -out certificates/pass-cert.p12
```

> **Note:** With OpenSSL 3.x, add the `-legacy` flag to the `pkcs12 -export` command. OpenSSL 3's default encryption is not readable by `node-forge`, which this service uses to load the certificate.

Set the export password as `CERT_PASSWORD` in `.env`.

### 5. Download the WWDR certificate as `wwdr.pem`

Apple's current pass certificates are issued by the WWDR **G4** intermediate. Download it and convert it to PEM:

```bash
curl -O https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
openssl x509 -inform DER -in AppleWWDRCAG4.cer -out certificates/wwdr.pem
```

### 6. Verify

Start the service and call `GET /api/v1/health` — it reports certificate status. You can also inspect the certificate directly:

```bash
openssl pkcs12 -in certificates/pass-cert.p12 -nokeys -info
# With OpenSSL 3.x add -legacy if the file was exported with -legacy
```

The certificate's subject should contain your Pass Type ID and Team ID.

## Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Documentation

### Generate Pass

**Endpoint:** `POST /api/v1/passes/generate`

**Headers:**
```
Content-Type: application/json
x-bundle-id: your_api_key
```

**Request Body:**
```json
{
  "passType": "generic",
  "serialNumber": "PASS123456",
  "data": {
    "headerFields": [
      {
        "key": "header1",
        "label": "Event",
        "value": "Concert"
      }
    ],
    "primaryFields": [
      {
        "key": "name",
        "label": "Name",
        "value": "John Doe"
      }
    ],
    "secondaryFields": [
      {
        "key": "location",
        "label": "Location",
        "value": "Madison Square Garden"
      }
    ],
    "barcode": {
      "format": "PKBarcodeFormatQR",
      "message": "TICKET123456",
      "messageEncoding": "iso-8859-1"
    }
  },
  "visual": {
    "foregroundColor": "#000000",
    "backgroundColor": "#FFFFFF",
    "labelColor": "#666666",
    "logoText": "EVENT"
  },
  "metadata": {
    "description": "Concert Ticket",
    "organizationName": "Event Organizer Inc.",
    "expirationDate": "2024-12-31T23:59:59Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "passUrl": "https://api.example.com/api/v1/passes/download/abc123",
    "passId": "abc123",
    "serialNumber": "PASS123456",
    "expiresAt": "2024-01-01T12:00:00Z"
  }
}
```

### Download Pass

**Endpoint:** `GET /api/v1/passes/download/{passId}`

Returns the .pkpass file for download.

### Health Check

**Endpoint:** `GET /api/v1/health`

Returns service health status and certificate information.

## Example Usage

### cURL
```bash
# Generate a pass
curl -X POST http://localhost:3000/api/v1/passes/generate \
  -H "Content-Type: application/json" \
  -H "x-bundle-id: your_api_key" \
  -d '{
    "passType": "generic",
    "serialNumber": "TEST001",
    "data": {
      "primaryFields": [{
        "key": "name",
        "label": "Name",
        "value": "John Doe"
      }]
    },
    "metadata": {
      "description": "Test Pass",
      "organizationName": "Test Org"
    }
  }'
```

### Node.js
```javascript
const axios = require('axios');

async function generatePass() {
  const response = await axios.post('http://localhost:3000/api/v1/passes/generate', {
    passType: 'generic',
    serialNumber: 'TEST001',
    data: {
      primaryFields: [{
        key: 'name',
        label: 'Name',
        value: 'John Doe'
      }]
    },
    metadata: {
      description: 'Test Pass',
      organizationName: 'Test Org'
    }
  }, {
    headers: {
      'x-bundle-id': 'your_api_key'
    }
  });

  console.log('Pass URL:', response.data.data.passUrl);
}
```

### iOS Integration
```swift
import PassKit

func addPassToWallet(passUrl: String) {
    guard let url = URL(string: passUrl) else { return }
    
    URLSession.shared.dataTask(with: url) { data, response, error in
        guard let data = data else { return }
        
        do {
            let pass = try PKPass(data: data)
            let passLibrary = PKPassLibrary()
            
            if passLibrary.containsPass(pass) {
                print("Pass already exists")
            } else {
                let addController = PKAddPassesViewController(pass: pass)
                self.present(addController, animated: true)
            }
        } catch {
            print("Error: \(error)")
        }
    }.resume()
}
```

## Testing

### Test Certificate Setup

For development without Apple certificates:

1. Generate test certificates:
```bash
cd certificates
openssl req -x509 -newkey rsa:2048 -keyout test-key.pem -out test-cert.pem -days 365 -nodes
openssl pkcs12 -export -out pass-cert.p12 -inkey test-key.pem -in test-cert.pem
# Use a simple password like "test"
# With OpenSSL 3.x, add -legacy to the pkcs12 command so node-forge can read the file
```

2. Create a dummy WWDR certificate:
```bash
echo "-----BEGIN CERTIFICATE-----
MIIBkjCCARmgAwIBAgIUTest0001
-----END CERTIFICATE-----" > wwdr.pem
```

**Note:** Test certificates will only work for API testing, not with actual iOS devices.

## Troubleshooting

### Certificate Errors
- Ensure certificates are in the correct format (.p12 and .pem)
- Verify certificate password is correct
- Check certificate hasn't expired

### Pass Not Installing
- Verify all required fields are present
- Check image assets are included
- Validate pass.json structure

### API Errors
- Check API key is included in headers
- Verify request body format
- Review server logs for detailed errors

## Security Notes

- Never commit certificates to version control
- Use strong API keys and rotate regularly
- Implement HTTPS in production
- Store certificate passwords securely
- Monitor and log all API access

## License

MIT

## Support

For issues and questions, please check the documentation or create an issue in the repository.