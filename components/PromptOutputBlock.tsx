
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface PromptOutputBlockProps {
  title: string;
  prompt: string;
  isLoading: boolean;
  isMarkdown?: boolean;
}

const PromptOutputBlock: React.FC<PromptOutputBlockProps> = ({ title, prompt, isLoading, isMarkdown = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const renderWithMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
        const key = `line-${index}`;
        if (line.trim() === '') return <div key={key} className="h-2" />;

        const processBold = (segment: string) => (
            segment.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                part.startsWith('**') && part.endsWith('**')
                    ? <strong key={`${key}-b-${i}`}>{part.slice(2, -2)}</strong>
                    : part
            )
        );

        if (line.trim().startsWith('* ')) {
            const content = line.trim().substring(2);
            return (
                <div key={key} className="flex items-start pl-4">
                    <span className="mr-2 mt-1"> •</span>
                    <span>{processBold(content)}</span>
                </div>
            );
        }

        return <p key={key} className="mb-1">{processBold(line)}</p>;
    });
  };

  return (
    <div className="bg-slate-900/70 rounded-lg border border-slate-700">
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
      <div className="p-4 min-h-[150px]">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
             <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        ) : prompt ? (
          isMarkdown
            ? <div className="text-slate-300 font-sans text-sm">{renderWithMarkdown(prompt)}</div>
            : <p className="text-slate-300 whitespace-pre-wrap break-words font-sans text-sm">{prompt}</p>
        ) : (
          <p className="text-slate-500 italic">Prompt yang dihasilkan akan muncul di sini.</p>
        )}
      </div>
    </div>
  );
};

export default PromptOutputBlock;
