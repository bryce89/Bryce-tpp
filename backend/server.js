const path = require('path');
const { initDB } = require('./db');
const app = require('./app');

// Future RBAC middleware stub:
// const rbac = require('./middleware/rbac');
// app.use('/api', rbac({ roles: ['engineer', 'manager', 'admin'] }));

// Serve built React frontend in production
const distPath = path.join(__dirname, '../frontend/dist');
app.use(require('express').static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

const PORT = process.env.PORT || 3001;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Project Mapper running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  });
