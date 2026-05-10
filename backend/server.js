const express = require('express');
const cors = require('cors');
const path = require('path');

// Future RBAC middleware stub:
// const rbac = require('./middleware/rbac');
// app.use('/api', rbac({ roles: ['engineer', 'manager', 'admin'] }));

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB (runs seed on first boot)
require('./db');

// Routes
app.use('/api/skills', require('./routes/skills'));
app.use('/api/engineers', require('./routes/engineers'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/assignments', require('./routes/assignments'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve built React frontend in production
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Project Mapper running on http://localhost:${PORT}`);
});
