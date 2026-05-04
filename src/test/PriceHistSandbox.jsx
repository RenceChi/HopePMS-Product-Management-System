import { useState } from 'react';
import { getPriceHistory, addPriceEntry } from '../services/priceHistService';

export default function PriceHistSandbox() {
  const [log, setLog] = useState('Price History Sandbox Ready.');
  
  // 🚨 CRITICAL: This prodcode MUST exist in your product table!
  // We are using TEST01 since we created it in the last test.
  const testProdCode = 'TEST01';
  const testUserId = 'test-m1-lead';

  const handleGetHistory = async () => {
    try {
      const data = await getPriceHistory(testProdCode);
      setLog(`Fetched History for ${testProdCode}:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setLog(`ERROR fetching history:\n${error.message}`);
    }
  };

  const handleAddPrice1 = async () => {
    try {
      // Adding a price for today
      const today = new Date().toISOString().slice(0, 10);
      await addPriceEntry(testProdCode, today, 99.50, testUserId);
      setLog(`SUCCESS: Added $99.50 on ${today} for ${testProdCode}`);
    } catch (error) {
      setLog(`ERROR adding price:\n${error.message}`);
    }
  };

  const handleAddPrice2 = async () => {
    try {
      // Adding a price for tomorrow to test the descending sort
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().slice(0, 10);
      
      await addPriceEntry(testProdCode, tomorrow, 150.00, testUserId);
      setLog(`SUCCESS: Added $150.00 on ${tomorrow} for ${testProdCode}`);
    } catch (error) {
      setLog(`ERROR adding price:\n${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', border: '2px solid #31511E', margin: '20px 0' }}>
      <h2 style={{ color: '#31511E', fontWeight: 'bold' }}>M1 Price History Sandbox</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={handleGetHistory} style={{ padding: '10px', background: '#e5e7eb' }}>1. Get History</button>
        <button onClick={handleAddPrice1} style={{ padding: '10px', background: '#dcfce7' }}>2. Add Today's Price</button>
        <button onClick={handleAddPrice2} style={{ padding: '10px', background: '#dcfce7' }}>3. Add Tomorrow's Price</button>
      </div>

      <div style={{ background: '#1e1e1e', color: '#00ff00', padding: '15px', borderRadius: '5px', minHeight: '200px' }}>
        <pre>{log}</pre>
      </div>
    </div>
  );
}