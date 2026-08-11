# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Apple Wallet Pass API service that generates .pkpass files for iOS applications. The service is built with Node.js, TypeScript, and Express.js, implementing custom pass generation without third-party pass libraries.

## Development Commands

### Initial Setup
```bash
npm init -y
npm install express typescript @types/express @types/node
npm install --save-dev ts-node nodemon @types/archiver @types/node-forge
npm install node-forge archiver dotenv
npx tsc --init
```

### Development
```bash
npm run dev     # Start development server with hot reload
npm run build   # Compile TypeScript to JavaScript
npm start       # Run production server
```

### Testing
```bash
npm test        # Run test suite
npm run test:watch  # Run tests in watch mode
```

### Linting and Type Checking
```bash
npm run lint    # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

## Architecture

### Core Components

1. **Pass Generation Pipeline** (`src/services/passGenerator.ts`)
   - Creates pass.json structure with Apple Wallet format
   - Manages field organization (header, primary, secondary, auxiliary, back)
   - Handles barcode generation

2. **Manifest Generation** (`src/services/manifestGenerator.ts`)
   - Calculates SHA-1 hashes for all pass bundle files
   - Creates manifest.json mapping

3. **Pass Signing** (`src/services/passSignature.ts`)
   - PKCS#7 signing using Pass Type ID certificate
   - Certificate chain management (Pass cert + WWDR)
   - DER-encoded signature generation

4. **Pass Bundle Creation**
   - ZIP archive containing: pass.json, manifest.json, signature, image assets
   - Binary .pkpass file generation

### API Structure

- **POST /api/v1/passes/generate** - Generate new pass with custom data
- **GET /api/v1/passes/download/:passId** - Download generated .pkpass file

### Certificate Requirements

Certificates must be placed in `certificates/` directory:
- `pass-cert.p12` - Pass Type ID certificate from Apple Developer Account
- `wwdr.pem` - Apple WWDR G4 certificate

Environment variables required:
- `PASS_TYPE_ID` - Pass Type Identifier (e.g., pass.com.company.generic)
- `TEAM_ID` - Apple Developer Team ID
- `CERT_PASSWORD` - Password for .p12 certificate

### Implementation Constraints

1. **No External Pass Libraries** - All pass generation logic must be implemented from scratch
2. **Allowed Dependencies**:
   - `express` - Web framework
   - `typescript` - Language support
   - `node-forge` - Cryptographic operations only
   - `archiver` - ZIP creation only
   - `sharp` - Image processing (if needed)

3. **Security Requirements**:
   - API key authentication via x-bundle-id header
   - Certificate files outside source control
   - Input validation and sanitization
   - Rate limiting per API key

### Testing Approach

1. Unit tests for individual services (pass generation, signing, manifest)
2. Integration tests for API endpoints
3. Manual validation using Apple's Pass Validator
4. Real device testing on iOS

### File Storage

- Temporary pass generation in `./temp/`
- Generated passes stored in `./generated-passes/`
- Automatic cleanup after TTL expiration