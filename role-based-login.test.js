const fs = require('fs');
const assert = require('node:assert/strict');
const test = require('node:test');

const loginHtml = fs.readFileSync('./Frontend/Login.html', 'utf8');
const sponsorExists = fs.existsSync('./Frontend/Sponsor.html');
const backend = fs.readFileSync('./Backend/server.js', 'utf8');

test('role-based login flow', () => {
  // Check role dropdown exists in login form
  assert.match(loginHtml, /id="role"/, 'Login form should have role select field');
  assert.match(loginHtml, /value="admin"/i, 'Role dropdown should have admin option');
  assert.match(loginHtml, /value="ngo"/i, 'Role dropdown should have NGO option');
  assert.match(loginHtml, /value="sponsor"/i, 'Role dropdown should have sponsor option');
  
  // Check sponsor page exists
  assert.equal(sponsorExists, true, 'Sponsor dashboard page should exist');
  
  // Check backend has routing logic
  assert.match(backend, /getRedirectPath/i, 'Backend should have redirect path routing function');
  assert.match(backend, /Sponsor\.html|Admin\.html|Dashboard\.html/, 'Backend should route to appropriate pages');
  assert.match(backend, /const.*role.*req\.body/i, 'Backend should extract role from request body');
});
