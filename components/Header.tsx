import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { GearIcon } from './icons/GearIcon';

interface HeaderProps {
  activeTool: string | null;
  onBack: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTool, onBack, onOpenSettings }) => {
  const Logo = () => (
    <div className="flex items-center gap-2 text-xl font-bold text-white">
      <LogoIcon className="h-6 w-6" />
      <span>TipsUNIX</span>
    </div>
  );

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto flex justify-between items-center">
        {activeTool ? (
          <button onClick={onBack} aria-label="Kembali ke halaman utama">
            <Logo />
          </button>
        ) : (
          <a href="#" aria-label="Beranda">
            <Logo />
          </a>
        )}
        
        <div className="flex items-center gap-4 sm:gap-6">
          {!activeTool && (
            <nav className="hidden sm:flex items-center gap-4 sm:gap-6">
              <a href="#tools" className="text-sm sm:text-base font-medium text-slate-300 hover:text-cyan-400 transition-colors duration-300">
                Tools
              </a>
              <a 
                href="https://www.youtube.com/c/TipsUNIX" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm sm:text-base font-medium bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors duration-300 shadow-lg shadow-cyan-500/20"
              >
                My Channel
              </a>
            </nav>
          )}
          <button 
            onClick={onOpenSettings} 
            className="text-slate-400 hover:text-cyan-400 transition-colors"
            aria-label="Pengaturan Kunci API"
          >
            <GearIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;