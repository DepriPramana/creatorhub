

import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface PromptOutputBlockProps {
  title: string;
  prompt: string;
  isLoading: boolean;
  onPromptChange?: (newPrompt: string) => void;
}

const PromptOutputBlock: React.FC<PromptOutputBlockProps> = ({ title, prompt, isLoading, onPromptChange }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/70 rounded-lg border border-slate-700 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        {prompt && !isLoading && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
            aria-label={`Copy ${title}`}
          >
            <ClipboardIcon className="w-5 h-5" />
            <span>{copied ? 'Disalin!' : 'Salin'}</span>
          </button>
        )}
      </div>
      <div className="p-4 flex-grow">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        ) : prompt ? (
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange?.(e.target.value)}
            readOnly={!onPromptChange}
            className="w-full h-full min-h-[200px] p-3 bg-slate-800 border border-slate-600 rounded-md text-slate-200 font-sans text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-y"
            aria-label={`${title} prompt text`}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-slate-500 italic">Prompt yang dihasilkan akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptOutputBlock;