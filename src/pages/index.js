// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLogs(['Processing request...']);

    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request }),
      });

      const data = await response.json();
      
      setResult(data.result);
      setLogs(prev => [...prev, ...data.logs]);
    } catch (error) {
      console.error('Error:', error);
      setLogs(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Orchestrator</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">Enter your request:</label>
          <textarea 
            className="w-full p-2 border rounded"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows="3"
            placeholder="Example: Clean this dataset and analyze sentiment"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {logs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Logs</h2>
          <div className="bg-gray-100 p-4 rounded">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div>
          <h2 className="text-xl font-bold mb-2">Result</h2>
          <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}