import React, { useState, useCallback } from 'react';
import { generateUnixCommand } from '../services/geminiService';
import { TerminalIcon } from '../components/icons/TerminalIcon';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';

const UnixCommandGeneratorPage: React.FC = () => {
    const [taskDescription, setTaskDescription] = useState('find all files larger than 100MB in the current directory and list them by size');
    const [result, setResult] = useState<{ command: string; explanation: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!taskDescription.trim()) {
            setError('Silakan masukkan deskripsi tugas.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateUnixCommand(taskDescription);
            setResult(response);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [taskDescription]);

    const handleCopy = () => {
        if (!result?.command) return;
        navigator.clipboard.writeText(result.command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-slate-800 p-3 rounded-full mb-4 border border-slate-700">
                        <TerminalIcon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">AI Unix Command Generator</h2>
                    <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
                        Jelaskan tugas dalam bahasa Inggris biasa dan dapatkan perintah Unix/Linux yang sesuai secara instan.
                    </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl border border-slate-700 shadow-2xl shadow-slate-900/50">
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="task-input" className="block text-sm font-medium text-slate-300 mb-2">Jelaskan tugas yang ingin Anda lakukan:</label>
                            <textarea
                                id="task-input"
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="misalnya, temukan semua file .log di direktori saat ini dan hapus"
                                className="w-full h-24 p-4 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 resize-y"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    
                    <div className="p-6 border-t border-slate-700">
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-cyan-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-cyan-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 disabled:shadow-none text-lg"
                        >
                            {isLoading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 <span>Menghasilkan...</span>
                                </>
                            ) : (
                                'Hasilkan Perintah'
                            )}
                        </button>
                    </div>
                </div>

                 <div className="mt-8">
                    {error && <div role="alert" className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-6">{error}</div>}
                    
                    {isLoading && (
                        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 animate-pulse">
                            <div className="h-8 bg-slate-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                            <div className="h-4 bg-slate-700 rounded w-5/6 mt-2"></div>
                        </div>
                    )}

                    {!isLoading && result && (
                         <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="p-4 bg-slate-900/70 rounded-t-lg border-b border-slate-700 relative">
                                <pre className="text-cyan-300 font-mono text-sm whitespace-pre-wrap break-all pr-16">
                                    <code>{result.command}</code>
                                </pre>
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-3 right-3 flex items-center gap-2 text-xs text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors px-2 py-1 rounded-md"
                                    aria-label="Salin perintah"
                                >
                                    <ClipboardIcon className="w-4 h-4" />
                                    <span>{copied ? 'Disalin!' : 'Salin'}</span>
                                </button>
                            </div>
                            <div className="p-4">
                                <p className="text-slate-300 text-sm">{result.explanation}</p>
                            </div>
                        </div>
                    )}
                    
                    {!isLoading && !result && !error && (
                        <div className="text-center text-slate-500 p-8 border-2 border-dashed border-slate-700 rounded-xl">
                            <TerminalIcon className="w-12 h-12 mx-auto mb-2" />
                            Perintah yang dihasilkan akan muncul di sini.
                        </div>
                    )}

                 </div>
            </div>
        </div>
    );
};

export default UnixCommandGeneratorPage;