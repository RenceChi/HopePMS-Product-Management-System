import { useState } from 'react';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  softDeleteProduct, 
  recoverProduct 
} from '../services/productService'; // Adjust this path if needed!

export default function ProductSandbox() {
  const [log, setLog] = useState('Sandbox Ready. Click a button to test.');
  
  // We use a fake user ID just to see if the stampHelper catches it
  const testUserId = 'test-m1-lead';
  const testProdCode = 'TEST01';

  const handleGetAsUser = async () => {
    try {
      const data = await getProducts('USER');
      setLog(`[USER] Products fetched (ACTIVE only):\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setLog(`ERROR fetching as USER:\n${error.message}`);
    }
  };

  const handleGetAsAdmin = async () => {
    try {
      const data = await getProducts('ADMIN');
      setLog(`[ADMIN] Products fetched (ALL statuses):\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setLog(`ERROR fetching as ADMIN:\n${error.message}`);
    }
  };

  const handleAdd = async () => {
    try {
      const payload = { prodcode: testProdCode, description: 'Sandbox Test Item', unit: 'pc' };
      await addProduct(payload, testUserId);
      setLog(`SUCCESS: Added product ${testProdCode}`);
    } catch (error) {
      setLog(`ERROR adding product:\n${error.message}`);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = { description: 'UPDATED Sandbox Item', unit: 'ea' };
      await updateProduct(testProdCode, payload, testUserId);
      setLog(`SUCCESS: Updated product ${testProdCode}`);
    } catch (error) {
      setLog(`ERROR updating product:\n${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await softDeleteProduct(testProdCode, testUserId);
      setLog(`SUCCESS: Soft-Deleted product ${testProdCode}`);
    } catch (error) {
      setLog(`ERROR deleting product:\n${error.message}`);
    }
  };

  const handleRecover = async () => {
    try {
      await recoverProduct(testProdCode, testUserId);
      setLog(`SUCCESS: Recovered product ${testProdCode}`);
    } catch (error) {
      setLog(`ERROR recovering product:\n${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>M1 API Sandbox</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={handleGetAsUser} style={{ padding: '10px' }}>1. Get Products (USER)</button>
        <button onClick={handleGetAsAdmin} style={{ padding: '10px' }}>2. Get Products (ADMIN)</button>
        <button onClick={handleAdd} style={{ padding: '10px' }}>3. Add TEST001</button>
        <button onClick={handleUpdate} style={{ padding: '10px' }}>4. Update TEST001</button>
        <button onClick={handleDelete} style={{ padding: '10px' }}>5. Soft Delete TEST001</button>
        <button onClick={handleRecover} style={{ padding: '10px' }}>6. Recover TEST001</button>
      </div>

      <div style={{ background: '#1e1e1e', color: '#00ff00', padding: '15px', borderRadius: '5px', minHeight: '300px' }}>
        <pre>{log}</pre>
      </div>
    </div>
  );
}