import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
}

// Helper to clean up the code from markdown fences
const extractCode = (rawCode: string): string => {
  const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/;
  const match = rawCode.match(codeBlockRegex);
  return match ? match[1].trim() : rawCode.trim();
};


const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);
  const cleanCode = extractCode(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative bg-slate-900 rounded-md border border-slate-700">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 bg-slate-700 text-slate-300 text-xs font-semibold rounded hover:bg-slate-600 transition-colors"
      >
        {isCopied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="p-4 overflow-x-auto text-sm text-slate-300">
        <code className="font-mono">{cleanCode}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;