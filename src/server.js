import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllLicenses, revokeLicense, getLicenseByUserId } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

if (!process.env.ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD is not set in environment variables!');
  console.error('📝 Please add an admin password to the Secrets tab.');
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.error('❌ SESSION_SECRET is not set in environment variables!');
  console.error('📝 Please add a session secret to the Secrets tab.');
  process.exit(1);
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

function isAuthenticated(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/check-auth', (req, res) => {
  res.json({ authenticated: !!req.session.isAdmin });
});

app.get('/api/licenses', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    let { licenses, total } = await getAllLicenses(10000, 0);
    
    if (search) {
      const searchLower = search.toLowerCase();
      licenses = licenses.filter(license => 
        license.username.toLowerCase().includes(searchLower) ||
        license.license_key.toLowerCase().includes(searchLower) ||
        license.user_id.toLowerCase().includes(searchLower)
      );
      total = licenses.length;
    }
    
    const paginatedLicenses = licenses.slice(offset, offset + limit);
    
    res.json({
      licenses: paginatedLicenses,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
});

app.get('/api/stats', isAuthenticated, async (req, res) => {
  try {
    const { licenses: allLicenses } = await getAllLicenses(10000, 0);
    
    const stats = {
      total: allLicenses.length,
      active: allLicenses.filter(l => l.status === 'active').length,
      revoked: allLicenses.filter(l => l.status === 'revoked').length
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.post('/api/revoke/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.body.adminId || 'web-admin';
    
    const license = await getLicenseByUserId(userId);
    
    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }
    
    if (license.status === 'revoked') {
      return res.status(400).json({ error: 'License already revoked' });
    }
    
    const revokedLicense = await revokeLicense(userId, adminId);
    res.json({ success: true, license: revokedLicense });
  } catch (error) {
    console.error('Error revoking license:', error);
    res.status(500).json({ error: 'Failed to revoke license' });
  }
});

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

export function startWebServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 Web Dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 Access at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
}
