
import React, { useState, useCallback, useRef } from 'react';
import { generateMetadata, MetadataSettings, MetadataResult } from '../services/geminiService';
import { TagIcon } from '../components/icons/TagIcon';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';

type KeywordFormat = 'Single Only' | 'Double Only' | 'Mixed';
type ResultItem = { file: File; data: MetadataResult; id: string };

const geminiModels = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash Lite Preview' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.0 Flash Lite' },
];

const MetadataGeneratorPage: React.FC = () => {
    const [settings, setSettings] = useState<MetadataSettings>({
        titleLength: 100,
        keywordCount: 40,
        descriptionLength: 150,
        keywordFormat: 'Mixed',
        includeKeywords: 'technology, innovation, AI',
        excludeKeywords: 'spam, clickbait, generic',
    });
    const [selectedModelName, setSelectedModelName] = useState(geminiModels[0].name);
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<ResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSettingsChange = (field: keyof MetadataSettings, value: string | number | KeywordFormat) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
            const newFiles = Array.from(selectedFiles);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (files.length === 0) {
            setError('Silakan unggah setidaknya satu file gambar.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults([]);

        const modelToUse = geminiModels.find(m => m.name === selectedModelName) || geminiModels[0];

        try {
            const promises = files.map(file => generateMetadata(file, settings, modelToUse));
            const settledResults = await Promise.allSettled(promises);
            
            const newResults: ResultItem[] = [];
            settledResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    newResults.push({ file: files[index], data: result.value, id: `${files[index].name}-${Date.now()}` });
                } else {
                    console.error(`Gagal menghasilkan metadata untuk ${files[index].name}:`, result.reason);
                    if(!error) {
                        const errorMessage = result.reason instanceof Error ? result.reason.message : 'Terjadi kesalahan yang tidak diketahui.';
                        setError(`Gagal memproses ${files[index].name}: ${errorMessage}`);
                    }
                }
            });
            setResults(newResults);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [files, settings, selectedModelName, error]);
    
    const handleCopy = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
    };

    const handleExportCsv = () => {
        if (results.length === 0) return;

        const escapeCsvField = (field: any): string => {
            const stringField = String(field);
            // If the field contains a comma, double quote, or newline, wrap it in double quotes.
            if (stringField.search(/("|,|\n)/g) >= 0) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };

        const headers = ['Filename', 'Title', 'Keywords', 'Description', 'Model'];
        const rows = results.map(({ file, data }) => [
            escapeCsvField(file.name),
            escapeCsvField(data.title),
            escapeCsvField(data.keywords.join(', ')),
            escapeCsvField(data.description),
            escapeCsvField(data.modelName),
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'metadata_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Uploader and Settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Uploader */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Unggah File</h3>
                             {files.length > 0 && (
                                <button onClick={() => { setFiles([]); setResults([]);}} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">HAPUS SEMUA</button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div 
                                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-cyan-400 bg-slate-700/50' : 'border-slate-600'}`}
                                onDragEnter={() => setIsDragging(true)}
                                onDragLeave={() => setIsDragging(false)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    handleFileSelect(e.dataTransfer.files);
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 010-2.828L14 8" /></svg>
                                <p className="text-slate-400 mb-2">Letakkan atau Pilih File</p>
                                <button onClick={() => fileInputRef.current?.click()} className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors">
                                    Telusuri File
                                </button>
                            </div>
                            <div className="border border-slate-700 rounded-lg p-4 bg-slate-900/50">
                                <h4 className="font-semibold text-white mb-2">File yang Diunggah ({files.length})</h4>
                                {files.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-slate-500">Belum ada file yang diunggah</div>
                                ) : (
                                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {files.map((file, index) => (
                                            <li key={`${file.name}-${index}`} className="text-sm text-slate-300 bg-slate-800 p-2 rounded flex justify-between items-center">
                                                <span className="truncate">{file.name}</span>
                                                <button onClick={() => setFiles(f => f.filter((_, i) => i !== index))} className="text-slate-500 hover:text-red-400 ml-2 flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Settings */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">Pengaturan Penting</h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="titleLength" className="flex justify-between text-sm font-medium text-slate-300">Panjang Judul <span>{settings.titleLength} chars</span></label>
                                    <input id="titleLength" type="range" min="30" max="200" value={settings.titleLength} onChange={e => handleSettingsChange('titleLength', parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                                </div>
                                <div>
                                    <label htmlFor="keywordCount" className="flex justify-between text-sm font-medium text-slate-300">Jumlah Kata Kunci <span>{settings.keywordCount}</span></label>
                                    <input id="keywordCount" type="range" min="10" max="50" value={settings.keywordCount} onChange={e => handleSettingsChange('keywordCount', parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                                </div>
                                <div>
                                    <label htmlFor="descriptionLength" className="flex justify-between text-sm font-medium text-slate-300">Panjang Deskripsi <span>{settings.descriptionLength} chars</span></label>
                                    <input id="descriptionLength" type="range" min="50" max="300" value={settings.descriptionLength} onChange={e => handleSettingsChange('descriptionLength', parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Format Kata Kunci</label>
                                <div className="flex gap-2">
                                    {(['Single Only', 'Double Only', 'Mixed'] as KeywordFormat[]).map(format => (
                                        <button key={format} onClick={() => handleSettingsChange('keywordFormat', format)} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${settings.keywordFormat === format ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                            {format}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="includeKeywords" className="text-sm font-medium text-slate-300">Sertakan Kata Kunci</label>
                                    <input id="includeKeywords" type="text" value={settings.includeKeywords} onChange={e => handleSettingsChange('includeKeywords', e.target.value)} placeholder="teknologi, inovasi, AI" className="mt-1 w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label htmlFor="excludeKeywords" className="text-sm font-medium text-slate-300">Kecualikan Kata Kunci</label>
                                    <input id="excludeKeywords" type="text" value={settings.excludeKeywords} onChange={e => handleSettingsChange('excludeKeywords', e.target.value)} placeholder="spam, clickbait, generik" className="mt-1 w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-cyan-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                     <button onClick={handleGenerate} disabled={isLoading || files.length === 0} className="w-full flex items-center justify-center gap-3 bg-cyan-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-cyan-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed text-lg">
                        {isLoading ? 'Menghasilkan...' : 'Hasilkan Metadata'}
                    </button>
                    
                    {/* Results Section */}
                    <div className="mt-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Hasil</h3>
                        {error && !isLoading && <div role="alert" className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-4">{error}</div>}
                        
                        <div className="space-y-4">
                            {isLoading && results.length === 0 && files.map((file, i) => (
                                <div key={`loader-${i}`} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 animate-pulse">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 bg-slate-700 rounded-md"></div>
                                        <div className="flex-1 space-y-3 py-2">
                                            <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                                            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                                            <div className="h-3 bg-slate-700 rounded w-full"></div>
                                            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {results.length > 0 && results.map(({ file, data, id }) => (
                                <div key={id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <div className="flex gap-4">
                                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white">{data.title}</h4>
                                            <div className="mt-3">
                                                <h5 className="text-sm font-semibold text-slate-300 mb-2">Kata kunci:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {data.keywords.map((kw, i) => (
                                                        <span key={i} className="text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded-full">{kw}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleCopy(JSON.stringify(data, null, 2))} className="text-slate-400 hover:text-cyan-400 flex-shrink-0 self-start">
                                            <ClipboardIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        <h5 className="text-sm font-semibold text-slate-300 mb-2">Deskripsi:</h5>
                                        <p className="text-sm text-slate-400">{data.description}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-3 text-right">Dihasilkan oleh: {data.modelName}</p>
                                </div>
                            ))}

                            {!isLoading && results.length === 0 && (
                                <div className="text-center text-slate-500 p-8 border-2 border-dashed border-slate-700 rounded-xl">
                                    <TagIcon className="w-12 h-12 mx-auto mb-2" />
                                    Hasil yang dihasilkan akan muncul di sini.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Model and Export */}
                <div className="lg:col-span-1 sticky top-24 space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                         <h3 className="text-lg font-bold text-white mb-4">Model Gemini</h3>
                         <select 
                            value={selectedModelName}
                            onChange={(e) => setSelectedModelName(e.target.value)}
                            disabled={isLoading}
                            className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                          >
                            {geminiModels.map(model => <option key={model.name} value={model.name}>{model.name}</option>)}
                          </select>
                    </div>
                     <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                         <h3 className="text-lg font-bold text-white mb-4">Opsi Ekspor</h3>
                         <p className="text-sm text-slate-400 mb-4">Pilih platform untuk mengekspor metadata Anda.</p>
                         <button 
                            onClick={handleExportCsv}
                            disabled={results.length === 0 || isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-green-700 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            <span>Ekspor ke CSV</span>
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetadataGeneratorPage;
