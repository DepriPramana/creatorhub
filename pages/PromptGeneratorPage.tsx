

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
    generatePrompts, 
    PromptGenerationParams,
    generateImageFromPrompt,
    startVideoGeneration,
    checkVideoGenerationStatus,
    fetchVideo
} from '../services/geminiService';
import { MagicWandIcon } from '../components/icons/MagicWandIcon';
import PromptOutputBlock from '../components/PromptOutputBlock';
import { CameraIcon, VideoCameraIcon } from '../components/icons/VideoCameraIcon';


const artStyleOptions = [
  'Chibi Style Cartoon',
  'Photorealistic',
  'Digital Painting',
  'Concept Art',
  '3D Render',
  'Anime / Manga',
  'Pixel Art',
  'Watercolor',
  'Vector Art',
  'Low Poly',
  'Cyberpunk',
  'Steampunk',
  'Fantasy Art',
  'Synthwave',
  'Minimalist',
  'Custom',
];

const PromptGeneratorPage: React.FC = () => {
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  
  const [concept, setConcept] = useState('A chibi-style girl walking happily with headphones on a sunny street.');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [styleSelection, setStyleSelection] = useState(artStyleOptions[0]);
  const [style, setStyle] = useState(artStyleOptions[0]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [duration, setDuration] = useState('15');
  
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatusMessage, setVideoStatusMessage] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    return () => {
        if (generatedVideoUrl) {
            URL.revokeObjectURL(generatedVideoUrl);
        }
    };
  }, [generatedVideoUrl]);

  const handleStyleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelection = e.target.value;
    setStyleSelection(newSelection);
    if (newSelection === 'Custom') {
      setStyle(''); // Hapus gaya agar pengguna dapat mengetik yang baru
    } else {
      setStyle(newSelection);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleGenerate = useCallback(async () => {
    if (inputMode === 'text' && !concept.trim()) {
      setError('Harap masukkan konsep untuk menghasilkan prompt.');
      return;
    }
    if (inputMode === 'image' && !imageFile) {
      setError('Silakan unggah file gambar.');
      return;
    }
    if (!style.trim()) {
      setError('Harap tentukan Gaya Seni kustom atau pilih salah satu dari daftar.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImagePrompt('');
    setVideoPrompt('');
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);

    const params: PromptGenerationParams = {
      concept: inputMode === 'text' ? concept : '',
      file: inputMode === 'image' ? imageFile! : undefined,
      style,
      aspectRatio,
      duration,
    };

    try {
      const result = await generatePrompts(params);
      setImagePrompt(result.imagePrompt);
      setVideoPrompt(result.videoPrompt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [concept, imageFile, inputMode, style, aspectRatio, duration]);

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);
    setError(null);
    try {
        const imageB64 = await generateImageFromPrompt(imagePrompt, aspectRatio);
        setGeneratedImage(imageB64);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
        setError(errorMessage);
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt || !generatedImage) return;

    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    setError(null);

    const videoMessages = [
        "Warming up the video engine...",
        "Conceptualizing the motion...",
        "Compositing scenes, this can take a few minutes...",
        "Applying digital cinematography...",
        "Adding special effects and filters...",
        "Rendering the final frames...",
        "Finalizing render, almost there!"
    ];
    let messageIndex = 0;
    setVideoStatusMessage(videoMessages[messageIndex]);

    try {
        let operation = await startVideoGeneration(videoPrompt, generatedImage);

        const pollVideoStatus = async () => {
            try {
                const updatedOperation = await checkVideoGenerationStatus(operation);
                operation = updatedOperation; // Keep the outer scope variable updated

                if (updatedOperation.done) {
                    const uri = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;

                    if (uri) {
                        setVideoStatusMessage('Video generated! Downloading...');
                        const videoBlob = await fetchVideo(uri);
                        const videoUrl = URL.createObjectURL(videoBlob);
                        setGeneratedVideoUrl(videoUrl);
                        setVideoStatusMessage('');
                        setIsGeneratingVideo(false);
                    } else {
                        const errorDetails = updatedOperation.error ? `API Error: ${JSON.stringify(updatedOperation.error)}` : "No URI found in the final response.";
                        throw new Error(`Video generation completed but failed. ${errorDetails}`);
                    }
                } else {
                    // Not done yet, poll again
                    messageIndex = (messageIndex + 1) % videoMessages.length;
                    setVideoStatusMessage(videoMessages[messageIndex]);
                    setTimeout(pollVideoStatus, 10000);
                }
            } catch (pollError) {
                const errorMessage = pollError instanceof Error ? pollError.message : 'An error occurred while checking video status.';
                setError(errorMessage);
                setIsGeneratingVideo(false);
                setVideoStatusMessage('');
            }
        };

        // Start the first poll
        setTimeout(pollVideoStatus, 10000);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start video generation.';
        setError(errorMessage);
        setIsGeneratingVideo(false);
    }
  };

  const renderSelect = (id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <select 
        id={id} 
        value={value} 
        onChange={onChange}
        disabled={isLoading}
        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
  
  const Loader = () => (
    <div className="flex justify-center items-center h-full">
        <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-slate-800 p-3 rounded-full mb-4 border border-slate-700">
            <MagicWandIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">AI Prompt Generator</h2>
          <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
            Ubah ide sederhana atau gambar Anda menjadi prompt yang sangat detail untuk model AI generatif.
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 shadow-2xl shadow-slate-900/50">
          {/* Inputs Section */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">1. Pilih Sumber Anda</h3>
            
            <div className="flex justify-center mb-6">
              <div className="bg-slate-900 p-1 rounded-lg flex gap-1">
                <button
                  onClick={() => setInputMode('text')}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
                    inputMode === 'text' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Dari Teks
                </button>
                <button
                  onClick={() => setInputMode('image')}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
                    inputMode === 'image' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Dari Gambar
                </button>
              </div>
            </div>

            {inputMode === 'text' ? (
              <div>
                <label htmlFor="concept-input" className="block text-sm font-medium text-slate-300 mb-2">Jelaskan Konsep Anda</label>
                <textarea
                  id="concept-input"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Contoh: Seekor naga emas terbang di atas pegunungan yang tertutup salju saat matahari terbenam"
                  className="w-full h-28 p-4 bg-slate-900 border border-slate-600 rounded-md text-slate-200 font-sans focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-y"
                  disabled={isLoading}
                  aria-label="Deskripsi konsep"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Unggah Gambar</label>
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
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    {imagePreview ? (
                      <div className="relative group">
                        <img src={imagePreview} alt="Image preview" className="max-h-40 rounded-lg"/>
                        <button 
                            onClick={handleFileRemove} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 010-2.828L14 8" /></svg>
                        <p className="text-slate-400 mb-2">Letakkan atau Pilih File</p>
                        <button onClick={() => fileInputRef.current?.click()} className="bg-cyan-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors">
                            Telusuri File
                        </button>
                      </>
                    )}
                </div>
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mt-6 mb-4">2. Sesuaikan Opsi Anda</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                {renderSelect('styleSelect', 'Gaya Seni', styleSelection, handleStyleSelectionChange, artStyleOptions)}
              </div>
              {renderSelect('aspectRatioSelect', 'Rasio Aspek Gambar', aspectRatio, (e) => setAspectRatio(e.target.value), ['1:1', '16:9', '9:16', '4:3', '3:4'])}
              {renderSelect('durationSelect', 'Durasi Video (detik)', duration, (e) => setDuration(e.target.value), ['5', '10', '15', '30', '60'])}
            </div>
            {styleSelection === 'Custom' && (
              <div className="mt-4">
                  <label htmlFor="customStyleInput" className="block text-sm font-medium text-slate-300 mb-2">Gaya Seni Kustom</label>
                  <input 
                    type="text" 
                    id="customStyleInput"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    placeholder="misalnya: Psychedelic, Vaporwave, dll."
                  />
              </div>
            )}
          </div>
          
          {/* Action Button */}
          <div className="p-6 border-t border-slate-700">
            <button
              onClick={handleGenerate}
              disabled={isLoading || (inputMode === 'text' && !concept.trim()) || (inputMode === 'image' && !imageFile)}
              className="w-full flex items-center justify-center gap-3 bg-cyan-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-cyan-600 transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 disabled:shadow-none text-lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menghasilkan...</span>
                </>
              ) : (
                <>
                  <MagicWandIcon className="w-6 h-6" />
                  <span>Hasilkan Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Outputs Section */}
        <div className="mt-8">
           {error && !isLoading && <div role="alert" className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-6">{error}</div>}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <PromptOutputBlock title="Prompt Gambar" prompt={imagePrompt} isLoading={isLoading} />
             <PromptOutputBlock title="Prompt Video" prompt={videoPrompt} isLoading={isLoading} isMarkdown={true} />
           </div>
        </div>

        {/* Media Generation Section */}
        {imagePrompt && videoPrompt && !isLoading && (
            <div className="mt-8 bg-slate-800/50 rounded-xl border border-slate-700 shadow-2xl shadow-slate-900/50">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">3. Hasilkan Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Image Section */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">Gambar</h4>
                             {!generatedImage && !isGeneratingImage && (
                                <button onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full flex items-center justify-center gap-2 bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors disabled:bg-slate-600">
                                    <CameraIcon className="w-5 h-5"/>
                                    Hasilkan Gambar
                                </button>
                            )}
                            <div className="aspect-square bg-slate-900/70 rounded-lg flex items-center justify-center border border-slate-700">
                                {isGeneratingImage ? <Loader/> : generatedImage ? (
                                    <img src={`data:image/jpeg;base64,${generatedImage}`} alt="Generated by AI" className="rounded-lg w-full h-full object-contain" />
                                ) : (
                                    <p className="text-slate-500 italic">Gambar yang dihasilkan akan muncul di sini.</p>
                                )}
                            </div>
                        </div>

                        {/* Video Section */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-white">Video</h4>
                             {generatedImage && !isGeneratingVideo && (
                                <button onClick={handleGenerateVideo} disabled={isGeneratingVideo} className="w-full flex items-center justify-center gap-2 bg-rose-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-rose-600 transition-colors disabled:bg-slate-600">
                                    <VideoCameraIcon className="w-5 h-5"/>
                                    Hasilkan Video
                                </button>
                            )}
                             <div className="aspect-square bg-slate-900/70 rounded-lg flex items-center justify-center border border-slate-700">
                                {isGeneratingVideo ? (
                                    <div className="text-center p-4">
                                        <Loader/>
                                        <p className="text-slate-300 mt-4 text-sm">{videoStatusMessage}</p>
                                    </div>
                                ) : generatedVideoUrl ? (
                                    <video src={generatedVideoUrl} controls className="rounded-lg w-full h-full object-contain" />
                                ) : (
                                     <p className="text-slate-500 italic">Video yang dihasilkan akan muncul di sini.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default PromptGeneratorPage;