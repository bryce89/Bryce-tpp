async function teardown() {
  try {
    const { pool } = require('./db');
    await pool.end();
  } catch (e) {
    // Pool may already be closed
  }
}

module.exports = teardown;
