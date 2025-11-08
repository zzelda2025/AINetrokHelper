import React, { useState } from 'react';
import { generateConfig } from '../services/geminiService';
import Loader from './common/Loader';
import CodeBlock from './common/CodeBlock';

const ConfigGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for the configuration.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult('');

    const response = await generateConfig(prompt);
    
    if (response.startsWith('Error:')) {
      setError(response);
    } else {
      setResult(response);
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Configuration Generator</h2>
      <p className="text-slate-400 mb-6">Describe the network setup you need, and the AI will generate the Cisco IOS configuration.</p>
      
      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A router with two interfaces (GigabitEthernet0/0 and 0/1). Gi0/0 should have IP 192.168.1.1/24. Gi0/1 should have 10.0.0.1/24. Enable OSPF on both."
          className="w-full h-32 p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="self-start px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Config'}
        </button>
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      
      {loading && <Loader />}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-slate-300">Generated Configuration:</h3>
          <CodeBlock code={result} />
        </div>
      )}
    </div>
  );
};

export default ConfigGenerator;