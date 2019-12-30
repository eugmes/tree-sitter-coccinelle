'use strict';

const fs = require('fs');
const path = require('path');

const Parser = require('tree-sitter');
const Coccinelle = require('..');

function positionForOffset(input, offset) {
  var col = 1;
  var row = 1;

  for (var c of input.substr(0, offset)) {
    if (c == '\n') {
      row = row + 1;
      col = 1;
    } else {
      col = col + 1;
    }
  }

  return {
    col: col,
    row: row
  };
}

expect.extend({
  toParseWithoutErrors(received) {
    const parser = new Parser();
    parser.setLanguage(Coccinelle);

    const content = fs.readFileSync(received, 'utf8');
    const tree = parser.parse(content);

    const cursor = tree.walk();
    var firstError = null;

    while (true) {
      const node = cursor.currentNode;
      if (node.hasError()) {
        if (node.type == 'ERROR' || node.isMissing()) {
          firstError = node;
          break;
        } else {
          if (!cursor.gotoFirstChild()) {
            break;
          }
        }
      } else if (!cursor.gotoNextSibling()) {
        break;
      }
    }

    if (firstError) {
      const start = positionForOffset(content, firstError.startIndex);
      const end = positionForOffset(content, firstError.endIndex);
      const nodeName = firstError.isMissing ? `MISSING ${firstError.type}` : firstError.type;
      const message = `Parse error (${nodeName} [${start.row}:${start.col}] - [${end.row}:${end.col}])`;

      /* Make Jest show location of the parse error instead of location in this file. */
      const error = new Error(message);
      error.stack = `Error: ${message}\n   at ${received}:${start.row}:${start.col}`;
      throw error;
    } else {
      return {
        message: () => '',
        pass: true
      };
    }
  }
});

const examplesRoot = path.resolve(__dirname, 'examples');
const testDirs = fs
  .readdirSync(examplesRoot)
  .filter(dir => /^[a-z]+$/.test(dir));

describe.each(testDirs)('%s', dir => {
  const root = path.resolve(examplesRoot, dir);
  const cocciFiles = fs
    .readdirSync(root)
    .filter(file => /\.cocci$/.test(file));

  test.each(cocciFiles)('%s', file => {
    const filePath = path.resolve(root, file);
    expect(filePath).toParseWithoutErrors();
  });
});
