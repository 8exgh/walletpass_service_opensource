// End-to-end test: boots the compiled server with test certificates, generates
// a gym pass through the real API, downloads the .pkpass, and verifies the
// bundle (contents, manifest hashes, PKCS#7 signature structure).
//
// Prerequisites: `npm run build` and test certificates in ./certificates
// (see scripts/generate-test-certs.sh). Run with: node tests/e2e.mjs

import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const PORT = process.env.E2E_PORT || 3555;
const BASE = `http://localhost:${PORT}`;
const API = `${BASE}/api/v1`;
const API_KEY = 'test_api_key_1';

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function waitForHealth(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${API}/health`);
      if (res.ok) return true;
    } catch {
      // server not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

const server = spawn('node', ['dist/server.js'], {
  env: {
    ...process.env,
    PORT: String(PORT),
    NODE_ENV: 'development',
    API_KEYS: API_KEY,
    PASS_TYPE_ID: 'pass.com.example.gym',
    TEAM_ID: 'TESTTEAM01',
    CERT_PATH: './certificates/pass-cert.p12',
    CERT_PASSWORD: 'test',
    WWDR_PATH: './certificates/wwdr.pem',
    TEMP_DIR: './temp',
    PASSES_DIR: './generated-passes',
    LOG_LEVEL: 'warn',
  },
  stdio: ['ignore', 'inherit', 'inherit'],
});

let exitCode = 1;
try {
  console.log('Waiting for server to start...');
  if (!(await waitForHealth())) {
    throw new Error(`Server did not become healthy on port ${PORT}`);
  }

  console.log('\n1. Health check');
  const health = await (await fetch(`${API}/health`)).json();
  check('service reports healthy', health.status === 'healthy');
  check('certificate is valid', health.certificate?.valid === true);

  console.log('\n2. Authentication');
  const noAuth = await fetch(`${API}/passes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passType: 'generic' }),
  });
  check('request without API key is rejected', noAuth.status === 401, `got ${noAuth.status}`);

  console.log('\n3. Generate gym pass');
  const genRes = await fetch(`${API}/passes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bundle-id': API_KEY },
    body: JSON.stringify({
      passType: 'generic',
      serialNumber: 'GYM-E2E-001',
      data: {
        primaryFields: [{ key: 'memberId', label: 'MEMBER ID', value: 'ID-1234' }],
        secondaryFields: [{ key: 'validFrom', label: 'VALID FROM', value: 'Sep 3, 2025' }],
        barcode: { format: 'PKBarcodeFormatQR', message: 'ID-1234', messageEncoding: 'iso-8859-1' },
      },
      visual: { logoText: 'Fitness Center' },
      metadata: { description: 'Gym Membership', organizationName: 'Fitness Center' },
    }),
  });
  const gen = await genRes.json();
  check('generate returns 200', genRes.status === 200, `got ${genRes.status}`);
  check('generate reports success', gen.success === true);
  check('response includes passId', typeof gen.data?.passId === 'string' && gen.data.passId.length > 0);

  console.log('\n4. Download .pkpass');
  const dlRes = await fetch(`${API}/passes/download/${gen.data.passId}`);
  const pkpass = Buffer.from(await dlRes.arrayBuffer());
  check('download returns 200', dlRes.status === 200, `got ${dlRes.status}`);
  check(
    'content-type is application/vnd.apple.pkpass',
    dlRes.headers.get('content-type')?.includes('application/vnd.apple.pkpass'),
    `got ${dlRes.headers.get('content-type')}`
  );
  check('file is a ZIP archive (PK magic)', pkpass[0] === 0x50 && pkpass[1] === 0x4b);

  console.log('\n5. Verify pass bundle');
  const extractDir = mkdtempSync(path.join(tmpdir(), 'pkpass-'));
  try {
    const zipPath = path.join(extractDir, 'test.pkpass');
    await import('node:fs/promises').then((fs) => fs.writeFile(zipPath, pkpass));
    execFileSync('unzip', ['-o', '-q', zipPath, '-d', extractDir]);

    const files = readdirSync(extractDir);
    for (const required of ['pass.json', 'manifest.json', 'signature', 'icon.png']) {
      check(`bundle contains ${required}`, files.includes(required));
    }

    const passJson = JSON.parse(readFileSync(path.join(extractDir, 'pass.json'), 'utf-8'));
    check('pass.json serialNumber matches', passJson.serialNumber === 'GYM-E2E-001');
    check('pass.json passTypeIdentifier matches', passJson.passTypeIdentifier === 'pass.com.example.gym');
    check('pass.json teamIdentifier matches', passJson.teamIdentifier === 'TESTTEAM01');
    check('pass.json has member ID field', passJson.generic?.primaryFields?.[0]?.value === 'ID-1234');
    check('pass.json has QR barcode', passJson.barcodes?.[0]?.format === 'PKBarcodeFormatQR');

    // Every entry in manifest.json must be the SHA-1 of the corresponding file
    const manifest = JSON.parse(readFileSync(path.join(extractDir, 'manifest.json'), 'utf-8'));
    let hashesOk = true;
    for (const [file, expected] of Object.entries(manifest)) {
      const actual = createHash('sha1').update(readFileSync(path.join(extractDir, file))).digest('hex');
      if (actual !== expected) {
        hashesOk = false;
        console.error(`    manifest hash mismatch for ${file}`);
      }
    }
    check(`manifest SHA-1 hashes match all ${Object.keys(manifest).length} files`, hashesOk);
    check('manifest covers pass.json', 'pass.json' in manifest);
    check('manifest does not include itself or signature', !('manifest.json' in manifest) && !('signature' in manifest));

    // Signature must be a DER PKCS#7 SignedData structure
    // (SEQUENCE tag followed by OID 1.2.840.113549.1.7.2)
    const sig = readFileSync(path.join(extractDir, 'signature'));
    const signedDataOid = Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x02]);
    check('signature is DER-encoded', sig[0] === 0x30);
    check('signature is PKCS#7 SignedData', sig.includes(signedDataOid));
  } finally {
    rmSync(extractDir, { recursive: true, force: true });
  }

  console.log('\n6. Error handling');
  const notFound = await fetch(`${API}/passes/download/nonexistent0000`);
  check('unknown passId returns 404', notFound.status === 404, `got ${notFound.status}`);

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  exitCode = failed === 0 ? 0 : 1;
} catch (err) {
  console.error(`\nE2E test aborted: ${err.message}`);
  exitCode = 1;
} finally {
  server.kill('SIGTERM');
}

process.exit(exitCode);
