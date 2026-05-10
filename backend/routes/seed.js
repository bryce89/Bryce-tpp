const express = require('express');
const { forceSeed } = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
  await forceSeed();
  res.json({ success: true, message: 'Database seeded with sample data.' });
});

module.exports = router;
