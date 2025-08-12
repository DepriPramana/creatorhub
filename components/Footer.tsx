import React from 'react';
import { GithubIcon } from './icons/GithubIcon';
import { ThreadsIcon } from './icons/ThreadsIcon';
import { YoutubeIcon } from './icons/YoutubeIcon';
import { LogoIcon } from './icons/LogoIcon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <LogoIcon className="h-5 w-5" />
          <span>TipsUNIX</span>
        </div>
        <div className="flex gap-4">
          <a href="https://www.threads.com/@tipsunixs" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ThreadsIcon className="h-6 w-6" />
          </a>
          <a href="https://github.com/DepriPramana" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">
            <GithubIcon className="h-6 w-6" />
          </a>
          <a href="https://www.youtube.com/c/TipsUNIX" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">
            <YoutubeIcon className="h-6 w-6" />
          </a>
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} TipsUNIX. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;