import React, { useState, useCallback } from 'react';
import { generateSocialMediaPost, SocialMediaPostParams } from '../services/geminiService';
import { NewspaperIcon } from '../components/icons/NewspaperIcon';
import { ClipboardIcon } from '../components/icons/ClipboardIcon';

type Platform = 'Twitter/X' | 'LinkedIn' | 'Facebook' | 'Instagram';
const platforms: Platform[] = ['Twitter/X', 'LinkedIn', 'Facebook', 'Instagram'];
const tones = ['Professional', 'Casual', 'Humorous', 'Inspirational', 'Technical'];

const SocialMediaPostGeneratorPage: React.FC = () => {
    const [topic, setTopic] = useState('My new app just launched! It helps developers generate social media posts using AI.');
    const [platform, setPlatform] = useState<Platform>('Twitter/X');
    const [tone, setTone] = useState(tones[1]);
    const [includeHashtags, setIncludeHashtags] = useState(true);
    const [includeEmojis, setIncludeEmojis] = useState(true);

    const [post, setPost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Silakan masukkan topik untuk postingan Anda.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPost('');

        const params: SocialMediaPostParams = { topic, platform, tone, includeHashtags, includeEmojis };

        try {
            const result = await generateSocialMediaPost(params);
            setPost(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [topic, platform, tone, includeHashtags, includeEmojis]);
    
    const handleCopy = () => {
        if (!post) return;
        navigator.clipboard.writeText(post);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-slate-800 p-3 rounded-full mb-4 border border-slate-700">
                        <NewspaperIcon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">AI Social Media Post Generator</h2>
                    <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
                        Buat postingan yang menarik untuk berbagai platform media sosial dari ide sederhana.
                    </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl border border-slate-700 shadow-2xl shadow-slate-900/50">
                    <div className="p-6 space-y-6">
                        {/* Topic */}
                        <div>
                            <label htmlFor="topic-input" className="block text-sm font-medium text-slate-300 mb-2">Topik atau Tujuan Postingan</label>
                            <textarea
                                id="topic-input"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="misalnya. Umumkan fitur baru di aplikasi saya"
                                className="w-full h-24 p-4 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-cyan-500 transition-all duration-300 resize-y"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Platform */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Platform</label>
                            <div className="flex flex-wrap gap-2">
                                {platforms.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        disabled={isLoading}
                                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${platform === p ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tone & Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="tone-select" className="block text-sm font-medium text-slate-300 mb-2">Nada Suara</label>
                                <select
                                    id="tone-select"
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:ring-2 focus:ring-cyan-500 transition-all"
                                >
                                    {tones.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end space-x-6">
                                <label htmlFor="hashtags-checkbox" className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="hashtags-checkbox"
                                        checked={includeHashtags}
                                        onChange={(e) => setIncludeHashtags(e.target.checked)}
                                        disabled={isLoading}
                                        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    Sertakan Hashtag
                                </label>
                                <label htmlFor="emojis-checkbox" className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="emojis-checkbox"
                                        checked={includeEmojis}
                                        onChange={(e) => setIncludeEmojis(e.target.checked)}
                                        disabled={isLoading}
                                        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    Sertakan Emoji
                                </label>
                            </div>
                        </div>
                    </div>
                    {/* Generate Button */}
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
                                'Hasilkan Postingan'
                            )}
                        </button>
                    </div>
                </div>

                 {/* Output */}
                 <div className="mt-8">
                    {error && <div role="alert" className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-md mb-6">{error}</div>}
                    <div className="bg-slate-900/70 rounded-lg border border-slate-700 relative">
                        <div className="flex justify-between items-center p-4 border-b border-slate-700">
                             <h4 className="text-lg font-semibold text-white">Postingan yang Dihasilkan</h4>
                            {post && !isLoading && (
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-400 transition-colors"
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
                            </div>
                        ) : post ? (
                            <p className="text-slate-300 whitespace-pre-wrap break-words font-sans text-base">{post}</p>
                        ) : (
                            <p className="text-slate-500 italic text-center py-10">Postingan yang dihasilkan akan muncul di sini.</p>
                        )}
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default SocialMediaPostGeneratorPage;
