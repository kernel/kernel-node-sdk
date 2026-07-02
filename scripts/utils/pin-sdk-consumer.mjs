#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const [packageJSONPath, rawVersion] = process.argv.slice(2);

if (!packageJSONPath || !rawVersion) {
  console.error('usage: pin-sdk-consumer.mjs <package.json path> <sdk version>');
  process.exit(2);
}

const version = rawVersion.replace(/^v/, '');

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`invalid SDK version: ${rawVersion}`);
  process.exit(2);
}

const resolvedPath = path.resolve(packageJSONPath);
let packageJSON;

try {
  packageJSON = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`failed to read ${resolvedPath}: ${message}`);
  process.exit(1);
}

if (!packageJSON.dependencies || !Object.hasOwn(packageJSON.dependencies, '@onkernel/sdk')) {
  console.error(`${resolvedPath} does not declare dependencies["@onkernel/sdk"]`);
  process.exit(1);
}

const previous = packageJSON.dependencies['@onkernel/sdk'];
packageJSON.dependencies['@onkernel/sdk'] = version;

fs.writeFileSync(resolvedPath, `${JSON.stringify(packageJSON, null, 2)}\n`);

if (previous === version) {
  console.log(`@onkernel/sdk already pinned to ${version} in ${resolvedPath}`);
} else {
  console.log(`Pinned @onkernel/sdk in ${resolvedPath}: ${previous} -> ${version}`);
}
