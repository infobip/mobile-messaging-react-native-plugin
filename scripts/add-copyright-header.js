#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Set your project name here
const PROJECT_NAME = 'MobileMessagingReactNative';
const CURRENT_YEAR = new Date().getFullYear();

const exts = [
  '.js', '.jsx', '.ts', '.tsx', // JS/TS
  '.java', '.kt',               // Android
  '.m', '.mm', '.swift', '.h'         // iOS
];

const sourceDirs = [
  'src',         // JS/TS
  'android',     // Android
  'ios',         // iOS
  'Example'    // Example app
];

// Directories to exclude from .gitignore
const ignoredDirs = [
  'node_modules',
  'build',
  '.idea',
  '.gradle',
  'xcuserdata',
  'DerivedData',
  'project.xcworkspace',
  'buck-out',
  '.buckd',
  'Pods',
  'vendor',        // Ruby bundler vendor directory
  'fastlane',      // Fastlane generated files
  'coverage',      // Test coverage reports
  '.yarn',         // Yarn cache
  '.cxx',          // Android C++ build files
  '.kotlin',       // Kotlin build files
];

// Files to exclude from .gitignore
const ignoredFiles = [
  '.DS_Store',
  'npm-debug.log',
  'yarn-error.log',
  'local.properties',
  'Podfile.lock',
  'package-lock.json',
  '.metro-health-check',
  'debug.keystore',
  'google-services.json',
];

function shouldIgnoreDir(dirName) {
  return ignoredDirs.includes(dirName);
}

function shouldIgnoreFile(fileName) {
  return ignoredFiles.includes(fileName);
}

function makeHeader(fileName) {
  return `//
//  ${fileName}
//  ${PROJECT_NAME}
//
//  Copyright (c) 2016-${CURRENT_YEAR} Infobip Limited
//  Licensed under the Apache License, Version 2.0
//
`;
}

function hasLicensedUnder(content) {
  return content.toLowerCase().includes('licensed under');
}

function replaceOrAddHeader(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (hasLicensedUnder(content)) {
      // Skip files that already have "licensed under"
      return;
    }

    const fileName = path.basename(filePath);
    const header = makeHeader(fileName);

    // Detect an existing header at the top (lines starting with //)
    const lines = content.split('\n');
    let headerEndIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('//')) {
        headerEndIdx = i + 1;
      } else if (lines[i].trim() === '') {
        // Allow blank lines in header
        continue;
      } else {
        break;
      }
    }

    let newContent;
    if (headerEndIdx > 0) {
      // Replace existing header
      newContent = header + lines.slice(headerEndIdx).join('\n');
      console.log(`Header replaced: ${filePath}`);
    } else {
      // Add header
      newContent = header + '\n' + content;
      console.log(`Header added: ${filePath}`);
    }

    fs.writeFileSync(filePath, newContent, 'utf8');
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return;
  }
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    try {
      if (fs.statSync(fullPath).isDirectory()) {
        // Skip ignored directories entirely
        if (shouldIgnoreDir(file)) {
          return;
        }
        walk(fullPath);
      } else if (exts.includes(path.extname(fullPath))) {
        // Skip ignored files
        if (shouldIgnoreFile(file)) {
          return;
        }
        replaceOrAddHeader(fullPath);
      }
    } catch (err) {
      console.error(`Error accessing ${fullPath}: ${err.message}`);
    }
  });
}

// Run for all source directories
sourceDirs.forEach(dir => walk(dir));

console.log('✅ Copyright header addition/replacement complete.');