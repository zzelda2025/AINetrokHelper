import React, { useState } from 'react';
import { translateCommand } from '../services/geminiService';
import Loader from './common/Loader';
import CodeBlock from './common/CodeBlock';

const CommandTranslator: React.FC = () => {
  const [command, setCommand] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!command.trim()) {
      setError('Please enter a command to translate.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult('');

    const response = await translateCommand(command);

    if (response.startsWith('Error:')) {
        setError(response);
    } else {
        setResult(response);
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Command Translator</h2>
      <p className="text-slate-400 mb-6">Describe a task in plain English, and the AI will translate it into Cisco IOS commands.</p>
      
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g., block traffic from IP 10.1.1.1 on interface gigabit0/1"
          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="self-start px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      
      {loading && <Loader />}
      
      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-slate-300">Generated Commands:</h3>
          <CodeBlock code={result} />
        </div>
      )}
    </div>
  );
};

export default CommandTranslator;