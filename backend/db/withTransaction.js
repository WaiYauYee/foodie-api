// db/withTransaction.js
const pool = require("./database");

/**
 * Runs `fn(client)` inside BEGIN/COMMIT. Rolls back on error and always
 * releases the client exactly once.
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = withTransaction;