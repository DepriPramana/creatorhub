import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { TagIcon } from './icons/TagIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';

interface ToolsSectionProps {
  onSelectTool: (tool: string) => void;
}

const ToolCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  comingSoon?: boolean;
}> = ({ icon, title, description, onClick, comingSoon = false }) => (
  <button
    onClick={!comingSoon ? onClick : undefined}
    disabled={comingSoon}
    className={`bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg transition-all duration-300 relative overflow-hidden group text-left w-full ${
      !comingSoon
        ? 'cursor-pointer hover:border-cyan-500 hover:shadow-cyan-500/20 hover:-translate-y-1'
        : 'opacity-60 cursor-not-allowed'
    }`}
  >
    {comingSoon && (
      <div className="absolute top-2 right-2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
        Segera Hadir
      </div>
    )}
    <div className={`flex items-center justify-center h-12 w-12 rounded-lg bg-slate-700 mb-4 text-cyan-400 ${!comingSoon && 'group-hover:bg-cyan-500/20'}`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400">{description}</p>
    {!comingSoon && (
      <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500/0 group-hover:bg-cyan-500/50 transition-all duration-300"></div>
    )}
  </button>
);


const ToolsSection: React.FC<ToolsSectionProps> = ({ onSelectTool }) => {
  return (
    <section id="tools" className="py-20 sm:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Developer Tools</h2>
          <p className="mt-4 text-lg text-slate-400">
            Alat-alat berbasis AI untuk mempercepat alur kerja Anda.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <ToolCard 
            icon={<SparklesIcon className="w-6 h-6" />}
            title="AI Code Explainer"
            description="Tempelkan potongan kode dan biarkan AI menjelaskannya untuk Anda dengan bahasa yang sederhana dan mudah dimengerti."
            onClick={() => onSelectTool('code-explainer')}
          />
          <ToolCard 
            icon={<MagicWandIcon className="w-6 h-6" />}
            title="AI Prompt Generator"
            description="Buat prompt gambar dan video yang sangat detail dari ide sederhana untuk model generatif AI."
            onClick={() => onSelectTool('prompt-generator')}
          />
           <ToolCard 
            icon={<TagIcon className="w-6 h-6" />}
            title="AI Metadata Generator"
            description="Unggah gambar dan hasilkan judul, deskripsi, dan kata kunci yang relevan secara otomatis."
            onClick={() => onSelectTool('metadata-generator')}
          />
          <ToolCard 
            icon={<NewspaperIcon className="w-6 h-6" />}
            title="AI Social Media Post Generator"
            description="Buat postingan yang menarik untuk berbagai platform media sosial dari ide sederhana."
            onClick={() => onSelectTool('social-media-post')}
          />
          <ToolCard 
            icon={<TerminalIcon className="w-6 h-6" />}
            title="AI Unix Command Generator"
            description="Jelaskan tugas dalam bahasa Inggris biasa dan dapatkan perintah Unix/Linux yang sesuai secara instan."
            onClick={() => onSelectTool('unix-command')}
          />
          <ToolCard 
            icon={<VideoCameraIcon className="w-6 h-6" />}
            title="AI Viral Video Generator"
            description="Hasilkan ide video viral, skrip, dan aset produksi untuk konten berdurasi pendek."
            onClick={() => onSelectTool('viral-video-generator')}
          />
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;