import React, { useState, useCallback } from 'react';
import {
    generateViralTitles, ViralTitleParams, ViralTitleResponse,
    createVideoNarrative, VideoNarrativeParams, VideoNarrativeResponse,
    generateProductionAssets, ProductionAsset,
    generateThumbnailDesign, ThumbnailDesignResponse
} from '../services/geminiService';
import { VideoCameraIcon } from '../components/icons/VideoCameraIcon';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';

const highCpmCountries = [
    'Indonesia',
    'United States',
    'Germany',
    'Australia',
    'Canada',
    'United Kingdom',
    'Japan',
    'South Korea'
];

const nicheCategories = [
    'Viral',
    'Cerita Fiktif',
    'Konflik Perang',
    'Politik',
    'Bola',
    'Volli',
    'Horror',
    'Romance',
    'Comedy',
    'Drama'
];

const ViralVideoGeneratorPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1 state
    const [titleParams, setTitleParams] = useState<Omit<ViralTitleParams, 'count'>>({
        duration: 60,
        country: 'Indonesia',
        category: 'Konflik Perang',
        niche: 'Iran'
    });
    const [titleCount, setTitleCount] = useState(10);
    const [titleResults, setTitleResults] = useState<ViralTitleResponse | null>(null);
    const [selectedTitle, setSelectedTitle] = useState('');

    // Step 2 state
    const [narrative, setNarrative] = useState<VideoNarrativeResponse | null>(null);

    // Step 3 state
    const [productionAssets, setProductionAssets] = useState<ProductionAsset[]>([]);

    // Step 4 state
    const [thumbnailDesign, setThumbnailDesign] = useState<ThumbnailDesignResponse | null>(null);

    const handleGenerateTitles = async () => {
        setIsLoading(true);
        setError(null);
        setTitleResults(null);
        try {
            const params: ViralTitleParams = { ...titleParams, count: titleCount };
            const res = await generateViralTitles(params);
            setTitleResults(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSelectTitle = (title: string) => {
        setSelectedTitle(title);
        setCurrentStep(2);
    };

    const handleGenerateNarrative = async () => {
        if (!selectedTitle) return;
        setIsLoading(true);
        setError(null);
        setNarrative(null);
        try {
            const params: VideoNarrativeParams = { title: selectedTitle, duration: titleParams.duration, country: titleParams.country };
            const res = await createVideoNarrative(params);
            setNarrative(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAssets = async () => {
        if (!narrative || !selectedTitle) return;
        setIsLoading(true);
        setError(null);
        setProductionAssets([]);
        try {
            const res = await generateProductionAssets(narrative, selectedTitle, titleParams.country);
            setProductionAssets(res);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateThumbnail = async () => {
        if (!selectedTitle) return;
        setIsLoading(true);
        setError(null);
        setThumbnailDesign(null);
        try {
            const res = await generateThumbnailDesign(selectedTitle, titleParams.country);
            setThumbnailDesign(res);
        } catch(e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetAll = () => {
        setCurrentStep(1);
        setTitleResults(null);
        setSelectedTitle('');
        setNarrative(null);
        setProductionAssets([]);
        setThumbnailDesign(null);
        setError(null);
    };

    const renderStepper = () => {
        const steps = ['Titles', 'Narrative', 'Assets', 'Thumbnail'];
        return (
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-12">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                currentStep > index + 1 ? 'bg-green-500 border-green-500' :
                                currentStep === index + 1 ? 'bg-cyan-500 border-cyan-500' :
                                'bg-slate-700 border-slate-600'
                            }`}>
                                {currentStep > index + 1 ? '✓' : index + 1}
                            </div>
                            <p className={`mt-2 text-xs sm:text-sm font-semibold ${currentStep >= index + 1 ? 'text-white' : 'text-slate-400'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-1 h-1 rounded ${currentStep > index + 1 ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
        );
    }
    
    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
             <button onClick={handleCopy} className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400 transition-colors">
                <ClipboardIcon className="w-5 h-5" />
                <span>{copied ? 'Disalin!' : 'Salin'}</span>
            </button>
        )
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-slate-800 p-3 rounded-full mb-4 border border-slate-700">
                        <VideoCameraIcon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">AI Viral Video Generator</h2>
                    <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
                        Buat konten video pendek yang viral dengan bantuan AI, mulai dari ide hingga thumbnail.
                    </p>
                </div>
                
                {renderStepper()}
                
                {error && <div role="alert" className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-6">{error}</div>}

                {/* STEP 1: TITLE GENERATION */}
                {currentStep === 1 && (
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-6">
                        <h3 className="text-xl font-bold text-white">Langkah 1: Hasilkan Judul Viral</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Jumlah Judul</label>
                                <select value={titleCount} onChange={(e) => setTitleCount(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md">
                                    {[10, 20, 30, 40, 50].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Durasi Video (detik)</label>
                                <select value={titleParams.duration} onChange={(e) => setTitleParams(p => ({...p, duration: Number(e.target.value)}))} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md">
                                    {[15, 30, 60].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Target Negara</label>
                                <select 
                                    value={titleParams.country} 
                                    onChange={(e) => setTitleParams(p => ({...p, country: e.target.value}))} 
                                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md"
                                >
                                    {highCpmCountries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Niche Kategori</label>
                                <div className="bg-slate-900 border border-slate-600 rounded-md p-3 max-h-36 overflow-y-auto space-y-1 pr-2">
                                    {nicheCategories.map(cat => (
                                        <label key={cat} className="flex items-center text-slate-300 hover:bg-slate-800 p-2 rounded-md cursor-pointer transition-colors">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat}
                                                checked={titleParams.category === cat}
                                                onChange={(e) => setTitleParams(p => ({...p, category: e.target.value}))}
                                                className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-500 focus:ring-2 focus:ring-offset-0 focus:ring-offset-slate-800 focus:ring-cyan-500"
                                            />
                                            <span className="ml-3 text-sm font-medium">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Spesifik Niche</label>
                                <input type="text" value={titleParams.niche} onChange={(e) => setTitleParams(p => ({...p, niche: e.target.value}))} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md" />
                            </div>
                        </div>
                        <button onClick={handleGenerateTitles} disabled={isLoading} className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-md hover:bg-cyan-600 disabled:bg-slate-600">
                            {isLoading ? 'Menghasilkan...' : 'Hasilkan Judul'}
                        </button>
                         {isLoading && !titleResults && <div className="text-center p-4">Memuat...</div>}
                         {titleResults && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-2">Top 3 Potensi Viral (Analisis AI)</h4>
                                    <div className="space-y-4">
                                        {titleResults.analysis.map(item => (
                                            <div key={item.rank} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                                                <h5 className="font-bold text-cyan-400">#{item.rank}: {item.title}</h5>
                                                <p className="text-slate-400 mt-2 text-sm">{item.recommendation}</p>
                                                <button onClick={() => handleSelectTitle(item.title)} className="mt-3 bg-cyan-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-cyan-700">Pilih Judul Ini & Lanjutkan</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-2">Semua Judul yang Dihasilkan</h4>
                                    <ul className="list-decimal list-inside text-slate-300 space-y-1">
                                        {titleResults.titles.map((title, i) => <li key={i}>{title}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* STEP 2: NARRATIVE */}
                {currentStep === 2 && (
                     <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-6">
                         <h3 className="text-xl font-bold text-white">Langkah 2: Buat Narasi</h3>
                         <p className="text-slate-400">Judul yang Dipilih: <strong className="text-cyan-400">{selectedTitle}</strong></p>
                         <button onClick={handleGenerateNarrative} disabled={isLoading} className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-md hover:bg-cyan-600 disabled:bg-slate-600">
                             {isLoading ? 'Menghasilkan...' : 'Hasilkan Narasi'}
                         </button>
                         {narrative && (
                             <div className="space-y-4">
                                 {Object.entries(narrative).map(([key, value]) => (
                                     <div key={key} className="bg-slate-900/70 p-4 rounded-lg">
                                         <h5 className="font-bold text-cyan-400 capitalize">{key.replace('_', ' ')}</h5>
                                         <p className="text-slate-300 mt-2 text-sm whitespace-pre-wrap">{value}</p>
                                     </div>
                                 ))}
                                 <button onClick={() => setCurrentStep(3)} className="w-full bg-green-500 text-white font-semibold py-3 rounded-md hover:bg-green-600">Lanjutkan ke Aset Produksi</button>
                             </div>
                         )}
                     </div>
                )}
                
                {/* STEP 3: PRODUCTION ASSETS */}
                {currentStep === 3 && (
                     <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-6">
                         <h3 className="text-xl font-bold text-white">Langkah 3: Aset Produksi</h3>
                          <button onClick={handleGenerateAssets} disabled={isLoading} className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-md hover:bg-cyan-600 disabled:bg-slate-600">
                             {isLoading ? 'Menghasilkan...' : 'Hasilkan Aset'}
                         </button>
                         {productionAssets.length > 0 && (
                             <div className="space-y-4">
                                {productionAssets.map(asset => (
                                    <div key={asset.segment_name} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                                        <h5 className="font-bold text-cyan-400">{asset.segment_name} ({asset.timestamp})</h5>
                                        <div className="mt-3 space-y-4 text-sm">
                                            <p><span className="font-semibold">🎙️ Narasi:</span> <span className="text-slate-300">{asset.narrator_script}</span></p>
                                            <div>
                                                <div className="flex justify-between items-center"><p className="font-semibold">🖼️ Prompt Text-to-Image:</p> <CopyButton text={asset.text_to_image_prompt}/></div>
                                                <p className="text-slate-300 bg-slate-800 p-2 rounded mt-1 font-mono text-xs">{asset.text_to_image_prompt}</p>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center"><p className="font-semibold">📹 Prompt Image-to-Video:</p> <CopyButton text={asset.image_to_video_prompt}/></div>
                                                <p className="text-slate-300 bg-slate-800 p-2 rounded mt-1 font-mono text-xs">{asset.image_to_video_prompt}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => setCurrentStep(4)} className="w-full bg-green-500 text-white font-semibold py-3 rounded-md hover:bg-green-600">Lanjutkan ke Desain Thumbnail</button>
                             </div>
                         )}
                     </div>
                )}
                
                {/* STEP 4: THUMBNAIL */}
                {currentStep === 4 && (
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-6">
                        <h3 className="text-xl font-bold text-white">Langkah 4: Desain Thumbnail</h3>
                         <button onClick={handleGenerateThumbnail} disabled={isLoading} className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-md hover:bg-cyan-600 disabled:bg-slate-600">
                             {isLoading ? 'Menghasilkan...' : 'Hasilkan Desain Thumbnail'}
                         </button>
                         {thumbnailDesign && (
                             <div className="space-y-6">
                                 <div>
                                     <div className="flex justify-between items-center"><h4 className="text-lg font-bold text-white mb-2">🖼️ Prompt Thumbnail</h4><CopyButton text={thumbnailDesign.prompt}/></div>
                                     <p className="text-slate-300 bg-slate-800 p-3 rounded mt-1 font-mono text-sm">{thumbnailDesign.prompt}</p>
                                 </div>
                                 <div>
                                     <h4 className="text-lg font-bold text-white mb-2">Analisis AI</h4>
                                     <div className="text-slate-300 text-sm space-y-2">
                                         <p><strong className="text-cyan-400">Clickable:</strong> {thumbnailDesign.analysis.clickable}</p>
                                         <p><strong className="text-cyan-400">Emotional:</strong> {thumbnailDesign.analysis.emotional}</p>
                                         <p><strong className="text-cyan-400">Visual:</strong> {thumbnailDesign.analysis.visual}</p>
                                         <p><strong className="text-cyan-400">Optimized:</strong> {thumbnailDesign.analysis.optimized}</p>
                                     </div>
                                 </div>
                                 <div>
                                     <h4 className="text-lg font-bold text-white mb-2">Catatan Tambahan</h4>
                                     <div className="text-slate-300 text-sm space-y-2">
                                         <p><strong className="text-cyan-400">Iterasi:</strong> {thumbnailDesign.notes.iteration}</p>
                                         <p><strong className="text-cyan-400">A/B Testing:</strong> {thumbnailDesign.notes.ab_testing}</p>
                                         <p><strong className="text-cyan-400">Sesuaikan:</strong> {thumbnailDesign.notes.adjust}</p>
                                     </div>
                                 </div>
                                 <button onClick={resetAll} className="w-full bg-slate-600 text-white font-semibold py-3 rounded-md hover:bg-slate-700">Mulai dari Awal</button>
                             </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViralVideoGeneratorPage;