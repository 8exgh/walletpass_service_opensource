# Certificate Setup

This directory must contain the certificates used to sign Apple Wallet passes. No certificates ship with this repository — you create them yourself. **Never commit real certificates or private keys** (the repository `.gitignore` excludes everything in this directory except this README and `.gitkeep`).

## Required Files

| File | What it is |
|------|------------|
| `pass-cert.p12` | Your Pass Type ID certificate + private key, password-protected |
| `wwdr.pem` | Apple Worldwide Developer Relations (WWDR) G4 intermediate certificate, PEM format |

These names are the defaults expected by the service; override with `CERT_PATH` and `WWDR_PATH` in `.env` if needed. The `.p12` password goes in `CERT_PASSWORD`.

## How to Create Them

Full step-by-step instructions are in the main [README](../README.md#certificate-setup). Summary:

### 1. Pass Type ID certificate (`pass-cert.p12`)

1. In the [Apple Developer Portal](https://developer.apple.com/account), register a **Pass Type ID** (e.g. `pass.com.yourcompany.generic`) under Identifiers.
2. Create a Certificate Signing Request — via Keychain Access on macOS, or with OpenSSL:
   ```bash
   openssl genrsa -out pass-key.pem 2048
   openssl req -new -key pass-key.pem -out pass.certSigningRequest \
     -subj "/emailAddress=you@example.com/CN=Pass Certificate/C=US"
   ```
3. In the portal, create a **Pass Type ID Certificate** for your identifier, upload the CSR, and download `pass.cer`.
4. Combine the certificate and private key into a password-protected `.p12`:
   ```bash
   openssl x509 -inform DER -in pass.cer -out pass-cert.pem
   openssl pkcs12 -export -inkey pass-key.pem -in pass-cert.pem -out pass-cert.p12
   ```
   With OpenSSL 3.x, add `-legacy` to the `pkcs12 -export` command — OpenSSL 3's default encryption is not readable by node-forge.

   (If you used Keychain Access instead: import `pass.cer`, then export the certificate together with its private key as `pass-cert.p12`.)

### 2. WWDR certificate (`wwdr.pem`)

```bash
curl -O https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
openssl x509 -inform DER -in AppleWWDRCAG4.cer -out wwdr.pem
```

Current pass certificates are issued by the WWDR **G4** intermediate — use G4, not an older generation.

## Testing Certificates

For local API testing without an Apple Developer account (passes will not install on real devices), run the helper script from the repository root:

```bash
bash scripts/generate-test-certs.sh
```

It generates a self-signed `pass-cert.p12` (password `test`) and a stand-in `wwdr.pem` in this directory — the same certificates the e2e test suite and CI use.

## Security Notes

- **NEVER** commit certificates or private keys to version control
- Store the certificate password in environment variables, not in code
- Rotate certificates before they expire (Pass Type ID certificates last ~1 year)
- Keep backup copies in secure storage (password manager or secrets vault)
