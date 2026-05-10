const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/skills', require('./routes/skills'));
app.use('/api/engineers', require('./routes/engineers'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/assignments', require('./routes/assignments'));

app.use('/api/tests', require('./routes/tests'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
