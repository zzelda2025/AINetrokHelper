import React, { useState } from 'react';
import { diffConfigs } from '../services/geminiService';
import Loader from './common/Loader';

const ConfigDiff: React.FC = () => {
  const [configA, setConfigA] = useState<string>('');
  const [configB, setConfigB] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!configA.trim() || !configB.trim()) {
      setError('Please provide both old and new configurations.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult('');
    
    const response = await diffConfigs(configA, configB);

    if (response.startsWith('Error:')) {
        setError(response);
    } else {
        setResult(response);
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Configuration Diff Checker</h2>
      <p className="text-slate-400 mb-6">Paste two configurations to get a high-level summary of the changes.</p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-400">Old Configuration</label>
          <textarea
            value={configA}
            onChange={(e) => setConfigA(e.target.value)}
            placeholder="Paste old config here..."
            className="w-full h-64 p-3 bg-slate-900 border border-slate-700 rounded-md font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-400">New Configuration</label>
          <textarea
            value={configB}
            onChange={(e) => setConfigB(e.target.value)}
            placeholder="Paste new config here..."
            className="w-full h-64 p-3 bg-slate-900 border border-slate-700 rounded-md font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
            disabled={loading}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Comparing...' : 'Compare Configs'}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      
      {loading && <Loader />}

      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-slate-300">Change Summary:</h3>
          <div className="prose prose-invert prose-slate bg-slate-900 p-4 rounded-md border border-slate-700" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }}></div>
        </div>
      )}
    </div>
  );
};

export default ConfigDiff;