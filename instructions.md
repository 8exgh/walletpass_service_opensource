# Apple Wallet Pass API - Technical Specification

## 1. Overview

This specification defines the implementation of a REST API service that generates Apple Wallet passes. The API will accept requests from iOS applications and return properly formatted pass data that can be added to Apple Wallet.

## 2. Apple Developer Account Requirements (Client Responsibility)

Before the API can function, the following must be configured in your Apple Developer Account:

### 2.1 Required Certificates and Identifiers

1. **Pass Type Identifier**
    - Create a Pass Type ID (e.g., `pass.com.yourcompany.generic`)
    - This will be used in the pass.json file

2. **Pass Type ID Certificate**
    - Generate a Pass Type ID certificate for signing passes
    - Export as .p12 file with password
    - Provide to API: certificate file + password

3. **Team Identifier**
    - Found in your Apple Developer Account membership
    - Required for pass generation

4. **Apple WWDR (Worldwide Developer Relations) Certificate**
    - Download the Apple WWDR G4 certificate
    - Required for the certificate chain

### 2.2 Deliverables to Engineering Team
- Pass Type ID string
- Team Identifier string
- Pass Type ID Certificate (.p12 file)
- Certificate password
- WWDR Certificate (.pem file)

## 3. API Architecture

### 3.1 Technology Stack
- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Pass Generation**: Custom implementation (no third-party libraries)

### 3.2 Project Structure
```
wallet-pass-api/
├── src/
│   ├── controllers/
│   │   └── passController.ts
│   ├── services/
│   │   ├── passGenerator.ts
│   │   ├── passSignature.ts
│   │   └── manifestGenerator.ts
│   ├── models/
│   │   └── passModels.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── utils/
│   │   ├── crypto.ts
│   │   └── fileHelpers.ts
│   ├── config/
│   │   └── index.ts
│   ├── routes/
│   │   └── passRoutes.ts
│   └── app.ts
├── certificates/
│   ├── pass-cert.p12
│   └── wwdr.pem
├── assets/
│   └── pass-templates/
│       └── generic/
│           ├── icon.png
│           ├── icon@2x.png
│           ├── logo.png
│           └── logo@2x.png
├── dist/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 4. API Endpoints

### 4.1 Generate Pass
**Endpoint**: `POST /api/v1/passes/generate`

**Request Headers**:
```
Content-Type: application/json
X-API-Key: {api_key}
```

**Request Body**:
```typescript
{
  "passType": "generic", // For future extensibility
  "serialNumber": string, // Unique identifier for this pass
  "data": {
    "headerFields": [
      {
        "key": string,
        "label": string,
        "value": string
      }
    ],
    "primaryFields": [
      {
        "key": string,
        "label": string,
        "value": string
      }
    ],
    "secondaryFields": [
      {
        "key": string,
        "label": string,
        "value": string
      }
    ],
    "auxiliaryFields": [
      {
        "key": string,
        "label": string,
        "value": string
      }
    ],
    "backFields": [
      {
        "key": string,
        "label": string,
        "value": string
      }
    ],
    "barcode": {
      "format": "PKBarcodeFormatQR" | "PKBarcodeFormatPDF417" | "PKBarcodeFormatAztec",
      "message": string,
      "messageEncoding": "iso-8859-1"
    }
  },
  "visual": {
    "foregroundColor": string, // RGB hex color
    "backgroundColor": string,
    "labelColor": string,
    "logoText": string
  },
  "metadata": {
    "description": string,
    "organizationName": string,
    "expirationDate": string // ISO 8601
  }
}
```

**Response** (Success - 200):
```typescript
{
  "success": true,
  "data": {
    "passUrl": string, // URL to download the .pkpass file
    "passId": string,
    "serialNumber": string,
    "expiresAt": string // ISO 8601
  }
}
```

**Response** (Error - 400/500):
```typescript
{
  "success": false,
  "error": {
    "code": string,
    "message": string
  }
}
```

### 4.2 Download Pass
**Endpoint**: `GET /api/v1/passes/download/:passId`

**Response**: Binary .pkpass file with appropriate headers:
```
Content-Type: application/vnd.apple.pkpass
Content-Disposition: attachment; filename="pass.pkpass"
```

## 5. Implementation Details

### 5.1 Pass Generation Process

1. **Create pass.json structure**
   ```typescript
   interface PassJson {
     formatVersion: 1;
     passTypeIdentifier: string;
     serialNumber: string;
     teamIdentifier: string;
     description: string;
     organizationName: string;
     foregroundColor: string;
     backgroundColor: string;
     labelColor: string;
     logoText?: string;
     generic: {
       headerFields?: PassField[];
       primaryFields?: PassField[];
       secondaryFields?: PassField[];
       auxiliaryFields?: PassField[];
       backFields?: PassField[];
     };
     barcode?: Barcode;
     barcodes?: Barcode[];
     expirationDate?: string;
     voided?: boolean;
   }
   ```

2. **Generate manifest.json**
    - Calculate SHA-1 hash for each file in the pass bundle
    - Create manifest mapping filenames to hashes

3. **Sign the manifest**
    - Use PKCS#7 to create signature
    - Sign with Pass Type ID certificate
    - Include WWDR certificate in chain

4. **Create .pkpass bundle**
    - Structure as ZIP archive containing:
        - pass.json
        - manifest.json
        - signature (binary file)
        - Image assets (icon.png, logo.png, etc.)

### 5.2 Signing Implementation (passSignature.ts)

```typescript
// Key implementation steps:
1. Load p12 certificate and extract private key
2. Create PKCS#7 signed data structure
3. Add manifest.json as signed content
4. Include certificate chain (Pass cert + WWDR)
5. Generate DER-encoded signature
```

### 5.3 Security Considerations

1. **API Authentication**
    - Implement API key validation middleware
    - Store API keys securely (hashed)

2. **Certificate Security**
    - Store certificates outside source control
    - Use environment variables for certificate passwords
    - Implement certificate rotation mechanism

3. **Input Validation**
    - Validate all input fields
    - Sanitize user-provided text
    - Limit request size

4. **Rate Limiting**
    - Implement per-API-key rate limits
    - Consider implementing request queuing

### 5.4 Configuration (config/index.ts)

```typescript
export const config = {
  port: process.env.PORT || 3000,
  apiVersion: 'v1',
  certificates: {
    passTypeId: process.env.PASS_TYPE_ID,
    teamId: process.env.TEAM_ID,
    certPath: process.env.CERT_PATH,
    certPassword: process.env.CERT_PASSWORD,
    wwdrPath: process.env.WWDR_PATH
  },
  storage: {
    tempDir: './temp',
    passesDir: './generated-passes',
    ttl: 3600 // seconds
  },
  limits: {
    maxPassSize: 10 * 1024 * 1024, // 10MB
    maxRequestsPerMinute: 60
  }
};
```

### 5.5 Error Handling

Implement comprehensive error handling for:
- Invalid certificate or password
- Malformed pass data
- File system errors
- Signing failures
- Image processing errors

Error codes:
- `INVALID_INPUT`: Malformed request data
- `CERT_ERROR`: Certificate loading or validation error
- `SIGNING_ERROR`: Failed to sign pass
- `GENERATION_ERROR`: Failed to generate pass bundle
- `STORAGE_ERROR`: Failed to save pass file
- `NOT_FOUND`: Pass not found for download

## 6. Development Guidelines

### 6.1 No External Pass Libraries
- Implement all pass generation logic from scratch
- Use only Node.js built-in modules where possible
- Allowed npm packages:
    - `express`: Web framework
    - `typescript`: Language support
    - `node-forge`: For cryptographic operations (PKCS#7, certificates)
    - `archiver`: For ZIP creation
    - `sharp`: For image processing (if needed)

### 6.2 Testing Requirements
- Unit tests for pass generation logic
- Integration tests for API endpoints
- Test pass installation on actual iOS device
- Validate passes using Apple's Pass Validator

### 6.3 Logging
- Log all pass generation requests
- Log errors with full stack traces
- Implement request ID tracking

## 7. Deployment Considerations

### 7.1 Environment Variables
```env
NODE_ENV=production
PORT=3000
API_KEYS=key1,key2,key3
PASS_TYPE_ID=pass.com.company.generic
TEAM_ID=ABCDEF1234
CERT_PATH=./certificates/pass-cert.p12
CERT_PASSWORD=your_cert_password
WWDR_PATH=./certificates/wwdr.pem
```

### 7.2 Performance
- Implement caching for frequently requested passes
- Clean up temporary files regularly
- Consider implementing background job queue for generation

## 8. iOS App Integration

The iOS app should:
1. Make POST request to `/api/v1/passes/generate` with pass data
2. Receive pass URL in response
3. Download .pkpass file from provided URL
4. Use `PKPassLibrary` to add pass to wallet:
   ```swift
   let passData = // downloaded data
   let pass = PKPass(data: passData)
   let library = PKPassLibrary()
   library.addPasses([pass]) { (status) in
       // Handle result
   }
   ```

## 9. MVP Limitations & Future Enhancements

### 9.1 MVP Scope
- Single pass type (generic)
- No pass updates/push notifications
- No pass personalization
- Basic authentication only
- No database (file system storage)

### 9.2 Future Enhancements
- Multiple pass types (boarding pass, event ticket, etc.)
- Pass update notifications
- Database integration
- Pass analytics
- Batch generation
- Template management UI
- WebSocket support for real-time updates

## 10. Success Criteria

The MVP is considered complete when:
1. API can generate valid .pkpass files
2. Generated passes can be added to Apple Wallet
3. Pass displays correct information and barcode
4. API handles errors gracefully
5. Basic authentication is implemented
6. Passes are properly signed and validated

## 11. Resources

- [Apple Wallet Developer Guide](https://developer.apple.com/documentation/walletpasses)
- [Pass Design and Creation](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/)
- [PassKit Package Format Reference](https://developer.apple.com/library/archive/documentation/UserExperience/Reference/PassKit_Bundle/Chapters/Introduction.html)