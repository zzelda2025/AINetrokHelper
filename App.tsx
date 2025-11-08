import React, { useState } from 'react';
import { AppMode } from './types';
import ConfigGenerator from './components/ConfigGenerator';
import ConfigAnalyzer from './components/ConfigAnalyzer';
import ConfigDiff from './components/ConfigDiff';
import CommandTranslator from './components/CommandTranslator';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);

  const renderModeComponent = () => {
    switch (mode) {
      case AppMode.GENERATOR:
        return <ConfigGenerator />;
      case AppMode.ANALYZER:
        return <ConfigAnalyzer />;
      case AppMode.DIFF:
        return <ConfigDiff />;
      case AppMode.TRANSLATOR:
        return <CommandTranslator />;
      default:
        return <ConfigGenerator />;
    }
  };

  const NavButton: React.FC<{
    currentMode: AppMode;
    targetMode: AppMode;
    onClick: (mode: AppMode) => void;
    children: React.ReactNode;
  }> = ({ currentMode, targetMode, onClick, children }) => {
    const isActive = currentMode === targetMode;
    const baseClasses = 'px-4 py-2 text-sm md:text-base font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-400';
    const activeClasses = 'bg-cyan-600 text-white shadow-md';
    const inactiveClasses = 'bg-slate-700 text-slate-300 hover:bg-slate-600';
    
    return (
      <button
        onClick={() => onClick(targetMode)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            AI Network Config Helper
          </h1>
          <p className="mt-2 text-slate-400">
            Your AI assistant for Cisco IOS configuration tasks.
          </p>
        </header>

        <nav className="mb-8 p-2 bg-slate-800 rounded-lg shadow-lg flex flex-wrap justify-center gap-2 md:gap-4">
          <NavButton currentMode={mode} targetMode={AppMode.GENERATOR} onClick={setMode}>
            Generator
          </NavButton>
          <NavButton currentMode={mode} targetMode={AppMode.ANALYZER} onClick={setMode}>
            Analyzer
          </NavButton>
          <NavButton currentMode={mode} targetMode={AppMode.DIFF} onClick={setMode}>
            Diff Checker
          </NavButton>
          <NavButton currentMode={mode} targetMode={AppMode.TRANSLATOR} onClick={setMode}>
            Translator
          </NavButton>
        </nav>

        <main>
          {renderModeComponent()}
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;