const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      needs: [],
      applications: [],
      donations: [],
      contacts: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function isAdminLogin(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '').trim();

  return normalizedEmail === 'admin@flowreach.org'
    || normalizedEmail.includes('admin')
    || normalizedPassword === 'admin123';
}

function getRedirectPath(role, email, password) {
  // If role is explicitly specified, use it
  if (role === 'admin') return 'Admin.html';
  if (role === 'sponsor') return 'Sponsor.html';
  if (role === 'ngo') return 'Dashboard.html';
  
  // Fallback: check if credentials indicate admin
  if (isAdminLogin(email, password)) return 'Admin.html';
  
  // Default to user dashboard
  return 'Dashboard.html';
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FlowReach backend is running' });
});

app.get('/api/needs', (req, res) => {
  const data = readData();
  res.json(data.needs);
});

app.post('/api/needs', (req, res) => {
  const data = readData();
  const need = {
    id: Date.now(),
    name: req.body.name,
    region: req.body.region,
    population: Number(req.body.population),
    weeks: Number(req.body.weeks),
    stockout: req.body.stockout,
    createdAt: new Date().toISOString(),
    matchedQty: 0,
    delivered: false
  };

  data.needs.push(need);
  writeData(data);

  res.status(201).json({ message: 'Need saved successfully', need });
});

app.get('/api/contacts', (req, res) => {
  const data = readData();
  res.json(data.contacts);
});

app.post('/api/contacts', (req, res) => {
  const data = readData();
  const message = {
    id: Date.now(),
    fullName: req.body.fullName,
    email: req.body.email,
    message: req.body.message,
    createdAt: new Date().toISOString()
  };

  data.contacts.push(message);
  writeData(data);

  res.status(201).json({ message: 'Contact form submitted successfully', message });
});

app.get('/api/donations', (req, res) => {
  const data = readData();
  res.json(data.donations);
});

app.post('/api/donations', (req, res) => {
  const data = readData();
  const donation = {
    id: Date.now(),
    donorName: req.body.donorName,
    qty: Number(req.body.qty),
    createdAt: new Date().toISOString()
  };

  data.donations.push(donation);
  writeData(data);

  res.status(201).json({ message: 'Donation saved successfully', donation });
});

app.get('/api/applications', (req, res) => {
  const data = readData();
  res.json(data.applications);
});

app.post('/api/applications', (req, res) => {
  const data = readData();
  const application = {
    id: Date.now(),
    email: req.body.email,
    password: req.body.password,
    createdAt: new Date().toISOString()
  };

  data.applications.push(application);
  writeData(data);

  res.status(201).json({ message: 'Application created successfully', application });
});

app.post('/api/login', (req, res) => {
  const { email, password, role } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const data = readData();
  const resolvedRole = role || (isAdminLogin(email, password) ? 'admin' : 'user');

  // Admin login - check admin credentials first (hardcoded or registered)
  if (resolvedRole === 'admin') {
    if (!isAdminLogin(email, password)) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }
  }
  // For NGO and Sponsor roles, check if user is registered via signup
  else if (resolvedRole === 'ngo' || resolvedRole === 'sponsor') {
    const registeredUser = data.applications.find(
      app => app.email === email 
        && app.password === password 
        && app.role === resolvedRole
        && app.type === 'signup'  // Only valid if registered via signup
    );

    if (!registeredUser) {
      return res.status(401).json({ 
        message: `No registered ${resolvedRole} account found with these credentials. Please sign up first.`,
        code: 'NOT_REGISTERED'
      });
    }
  }

  // Record the login
  const application = {
    id: Date.now(),
    email,
    password,
    role: resolvedRole,
    createdAt: new Date().toISOString(),
    type: 'login'
  };

  data.applications.push(application);
  writeData(data);

  return res.status(200).json({
    message: 'Login successful',
    user: { email, role: resolvedRole },
    redirect: getRedirectPath(resolvedRole, email, password)
  });
});

app.post('/api/signup', (req, res) => {
  const { email, password, organizationName, role } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (!role || (role !== 'ngo' && role !== 'sponsor')) {
    return res.status(400).json({ message: 'Role must be either ngo or sponsor.' });
  }

  const data = readData();

  // Check if user already exists
  const existingUser = data.applications.find(
    app => app.email === email && app.role === role
  );

  if (existingUser) {
    return res.status(409).json({ 
      message: `An account with this email already exists for ${role} role.`,
      code: 'ALREADY_EXISTS'
    });
  }

  // Create new registration
  const newApplication = {
    id: Date.now(),
    email,
    password,
    organizationName: organizationName || email,
    role,
    status: 'active',
    createdAt: new Date().toISOString(),
    type: 'signup'
  };

  data.applications.push(newApplication);
  writeData(data);

  return res.status(201).json({
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully. You can now login.`,
    user: { email, role },
    redirect: 'Login.html'
  });
});

app.post('/api/admin-login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (!isAdminLogin(email, password)) {
    return res.status(401).json({ message: 'Admin access denied.' });
  }

  const data = readData();
  data.applications.push({
    id: Date.now(),
    email,
    password,
    createdAt: new Date().toISOString(),
    type: 'admin-login'
  });
  writeData(data);

  return res.status(200).json({
    message: 'Admin login successful',
    user: { email, role: 'admin' },
    redirect: 'Admin.html'
  });
});

app.listen(PORT, () => {
  console.log(`FlowReach backend running on http://localhost:${PORT}`);
});
