const fs = require('fs');
const assert = require('node:assert/strict');
const test = require('node:test');

const appJs = fs.readFileSync('./Frontend/App.js', 'utf8');

test('frontend loads need data from backend and not from local storage fallback', () => {
  assert.match(appJs, /fetch\(API_BASE \+ '\/needs'\)/, 'App should fetch needs from backend');
  assert.doesNotMatch(appJs, /localStorage\.getItem|localStorage\.setItem|Failed to fetch needs from backend, using localStorage/i, 'App should not use localStorage as data source');
});
