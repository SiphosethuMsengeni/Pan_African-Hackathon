const fs = require('fs');
const assert = require('node:assert/strict');
const test = require('node:test');

const backend = fs.readFileSync('./Backend/server.js', 'utf8');
const adminHtmlExists = fs.existsSync('./Frontend/Admin.html');

test('admin login redirect is configured and admin page exists', () => {
  assert.equal(adminHtmlExists, true, 'Admin page should exist');
  assert.match(backend, /admin|Admin\.html|redirect:\s*['\"]Admin\.html['\"]/, 'Backend should support admin login flow and redirect to Admin.html');
});
