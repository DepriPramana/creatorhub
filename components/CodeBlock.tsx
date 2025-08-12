
import React from 'react';

interface CodeBlockProps {
  content: string;
  isLoading: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ content, isLoading }) => {
  if (isLoading && !content) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
      </div>
    );
  }

  if (!content) {
    return <p className="text-slate-500 italic">Penjelasan akan muncul di sini setelah Anda menjalankan alat.</p>;
  }

  // Basic markdown-like styling using Tailwind's prose classes for better readability
  return (
    <div className="prose prose-invert prose-sm sm:prose-base max-w-none 
                   prose-headings:text-cyan-400 prose-strong:text-white 
                   prose-code:bg-slate-700 prose-code:text-slate-300 prose-code:rounded-md prose-code:px-1.5 prose-code:py-1
                   prose-a:text-cyan-400 hover:prose-a:text-cyan-500">
        <pre className="bg-slate-900/70 p-4 rounded-md whitespace-pre-wrap break-words">
            <code>{content}</code>
        </pre>
    </div>
  );
};

export default CodeBlock;
