#! /usr/bin/env node
'use strict';

/*
 * This script runs command passed to it together with arguments only when
 * it is run by `npm ci`.
 */
if (process.env.npm_config_refer === 'ci') {
  const spawn = require('child_process').spawn;
  const proc = spawn(process.argv[2], process.argv.slice(3), {stdio: 'inherit'});

  proc.on('close', (code) => {
    process.exit(code);
  })
} else {
  console.log(`> skipping: ${process.argv.slice(2).join(' ')}\n`);
  process.exit(0);
}
