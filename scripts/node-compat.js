#!/usr/bin/env node
/**
 * Run a command with the OpenSSL legacy provider ONLY where it is needed.
 *
 * WHY THIS EXISTS
 *   Angular 8 builds on webpack 4, which hashes module identifiers with MD4.
 *   OpenSSL 3 - bundled with Node 17 and later - moved MD4 into the legacy
 *   provider and refuses it by default, so the build dies with
 *   ERR_OSSL_EVP_UNSUPPORTED before emitting anything.
 *
 *   The flag that re-enables it, --openssl-legacy-provider, does not exist on
 *   Node 14. Passing it there makes node refuse to start. So a build script
 *   that hardcodes the flag breaks on the version this project specifies, and
 *   one that omits it breaks on every version a reviewer is likely to have.
 *
 *   This detects the running major version and adds the flag only when it is
 *   both required and valid. `npm run build` then works unchanged on Node 14
 *   and on Node 22, with nothing for the person running it to know.
 *
 * USAGE
 *   node scripts/node-compat.js <command> [args...]
 */
'use strict';

const { spawn } = require('child_process');

const major = parseInt(process.versions.node.split('.')[0], 10);
const NEEDS_LEGACY_OPENSSL = major >= 17;

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: node scripts/node-compat.js <command> [args...]');
  process.exit(2);
}

const env = Object.assign({}, process.env);
if (NEEDS_LEGACY_OPENSSL) {
  const existing = env.NODE_OPTIONS ? env.NODE_OPTIONS + ' ' : '';
  if (existing.indexOf('--openssl-legacy-provider') === -1) {
    env.NODE_OPTIONS = existing + '--openssl-legacy-provider';
  }
  console.log(
    '[node-compat] node v' + process.versions.node +
    ' uses OpenSSL 3; enabling the legacy provider so the webpack 4 build can hash.'
  );
} else {
  console.log(
    '[node-compat] node v' + process.versions.node +
    ' predates OpenSSL 3; no workaround needed.'
  );
}

const child = spawn(args[0], args.slice(1), {
  stdio: 'inherit',
  env: env,
  shell: process.platform === 'win32'
});

child.on('error', (err) => {
  console.error('[node-compat] could not start "' + args[0] + '": ' + err.message);
  console.error('[node-compat] REMEDY: run `npm install` first, from the repo root.');
  process.exit(2);
});
child.on('exit', (code, signal) => {
  if (signal) { process.exit(1); }
  process.exit(code === null ? 1 : code);
});
