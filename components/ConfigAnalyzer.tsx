import React, { useState } from 'react';
import { analyzeConfig } from '../services/geminiService';
import Loader from './common/Loader';

const ConfigAnalyzer: React.FC = () => {
  const [config, setConfig] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!config.trim()) {
      setError('Please paste a configuration to analyze.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult('');
    
    const response = await analyzeConfig(config);
    
    if (response.startsWith('Error:')) {
      setError(response);
    } else {
      setResult(response);
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Configuration Analyzer</h2>
      <p className="text-slate-400 mb-6">Paste a Cisco `running-config` below to get a summary, security analysis, and recommendations.</p>
      
      <div className="flex flex-col gap-4">
        <textarea
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          placeholder="Paste 'show running-config' output here..."
          className="w-full h-48 p-3 bg-slate-900 border border-slate-700 rounded-md font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="self-start px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Config'}
        </button>
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      
      {loading && <Loader />}

      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-slate-300">AI Analysis:</h3>
          <div className="prose prose-invert prose-slate bg-slate-900 p-4 rounded-md border border-slate-700" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }}></div>
        </div>
      )}
    </div>
  );
};

export default ConfigAnalyzer;