#!/usr/bin/env bash
# Generates self-signed test certificates for local development and CI.
# These allow the full pass-generation pipeline (including PKCS#7 signing)
# to run, but the resulting passes will NOT install on real iOS devices.
#
# Usage: scripts/generate-test-certs.sh [output-dir] [pass-type-id] [password]
set -euo pipefail

OUT_DIR="${1:-certificates}"
PASS_TYPE_ID="${2:-pass.com.example.gym}"
CERT_PASSWORD="${3:-test}"

mkdir -p "$OUT_DIR"
cd "$OUT_DIR"

# OpenSSL 3.x defaults to PKCS#12 encryption that node-forge cannot read;
# the -legacy flag restores the readable 3DES encoding.
LEGACY_FLAG=""
if openssl version | grep -qE "OpenSSL 3"; then
  LEGACY_FLAG="-legacy"
fi

# Self-signed pass certificate. CN must contain the Pass Type ID so the
# service's certificate verification finds it.
openssl req -x509 -newkey rsa:2048 -keyout test-key.pem -out test-cert.pem \
  -days 365 -nodes -subj "/CN=${PASS_TYPE_ID}/O=Test Org/C=US" 2>/dev/null

openssl pkcs12 -export $LEGACY_FLAG -out pass-cert.p12 \
  -inkey test-key.pem -in test-cert.pem -passout "pass:${CERT_PASSWORD}"

# Self-signed stand-in for the Apple WWDR intermediate certificate.
# Must be a real X.509 PEM because the signer parses it.
openssl req -x509 -newkey rsa:2048 -keyout wwdr-key.pem -out wwdr.pem \
  -days 365 -nodes -subj "/CN=Test WWDR CA/O=Test/C=US" 2>/dev/null

echo "Test certificates written to $(pwd):"
ls -la pass-cert.p12 wwdr.pem
