import React, { useState, useEffect, useCallback } from 'react';

interface ApiKeyManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [showSavedMessage, setShowSavedMessage] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const storedKey = localStorage.getItem('google-api-key') || '';
            setApiKey(storedKey);
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('google-api-key', apiKey);
        setShowSavedMessage(true);
        setTimeout(() => {
            setShowSavedMessage(false);
            onClose();
        }, 2000);
    };

    const handleClear = () => {
        localStorage.removeItem('google-api-key');
        setApiKey('');
    };
    
    const handleEscape = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen, handleEscape]);

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-6 sm:p-8 relative w-full max-w-lg mx-4"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white" aria-label="Tutup modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex items-center gap-3 mb-4">
                     <span className="text-2xl" role="img" aria-label="key">🔑</span>
                     <h3 className="text-xl font-bold text-white">Kelola Kunci API Google AI</h3>
                </div>

                <p className="text-slate-400 mb-6 text-sm">
                    Kunci API Anda diperlukan untuk menggunakan alat AI. Kunci ini disimpan dengan aman di penyimpanan lokal peramban Anda dan tidak pernah dibagikan.
                </p>

                <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-300 mb-2">Kunci API Anda</label>
                <input
                    id="api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Masukkan kunci API Anda di sini"
                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    aria-label="Input Kunci API Google AI"
                />
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button 
                        onClick={handleSave} 
                        className="w-full bg-cyan-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors duration-300 disabled:bg-slate-600"
                        disabled={showSavedMessage}
                    >
                        {showSavedMessage ? 'Tersimpan!' : 'Simpan Kunci'}
                    </button>
                    {apiKey && (
                        <button onClick={handleClear} className="w-full bg-slate-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-700 transition-colors duration-300">
                            Hapus Kunci
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApiKeyManager;