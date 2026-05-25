const cron = require('node-cron');

const SYNC_URL = 'http://localhost:3000/api/sync';

console.log('Cron job started. Will sync every 6 hours.');

// Run every 6 hours at minute 0
cron.schedule('0 */6 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Triggering sync...`);
  try {
    const response = await fetch(SYNC_URL);
    const data = await response.json();
    console.log(`[${new Date().toISOString()}] Sync response:`, data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sync failed:`, error.message);
  }
});

// Optionally, run it once immediately on startup
console.log(`[${new Date().toISOString()}] Running initial sync...`);
fetch(SYNC_URL)
  .then(res => res.json())
  .then(data => console.log('Initial sync response:', data))
  .catch(err => console.error('Initial sync failed:', err.message));
