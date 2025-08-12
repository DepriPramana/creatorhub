
import React, { useState, useCallback } from 'react';
import { explainCodeStream } from '../services/geminiService';
import CodeBlock from '../components/CodeBlock';
import { SparklesIcon } from '../components/icons/SparklesIcon';

const CodeExplainerPage: React.FC = () => {
  const [code, setCode] = useState<string>('function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplainCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Silakan masukkan kode untuk dijelaskan.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setExplanation('');

    try {
      await explainCodeStream(code, (chunk) => {
        setExplanation((prev) => prev + chunk);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  return (
    <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-xl border border-slate-700 shadow-2xl shadow-slate-900/50 overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-cyan-400" />
              <span>AI Code Explainer</span>
            </h3>
            <p className="text-slate-400 mt-2">
              Tempelkan potongan kode di bawah ini dan biarkan asisten AI kami menguraikannya untuk Anda dalam bahasa sederhana.
            </p>
          </div>

          <div className="p-6 border-y border-slate-700">
            <label htmlFor="codeInput" className="block text-sm font-medium text-slate-300 mb-2">
              Potongan Kode Anda
            </label>
            <textarea
              id="codeInput"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Tempelkan kode Anda di sini..."
              className="w-full h-48 p-4 bg-slate-900 border border-slate-600 rounded-md text-slate-200 font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-y"
              disabled={isLoading}
              aria-label="Input kode untuk penjelasan"
            />
            <button
              onClick={handleExplainCode}
              disabled={isLoading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-cyan-600 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menjelaskan...</span>
                </>
              ) : (
                'Jelaskan Kode'
              )}
            </button>
          </div>

          <div className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Penjelasan</h4>
            {error && <div role="alert" className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-4">{error}</div>}
            
            <CodeBlock content={explanation} isLoading={isLoading} />
          </div>
        </div>
      </div>
  );
};

export default CodeExplainerPage;
