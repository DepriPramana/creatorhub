import React from 'react';
import { YoutubeIcon } from './icons/YoutubeIcon';
import { Logo } from './Logo';
import { UsersIcon } from './icons/UsersIcon';

const HeroSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-32 px-4">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Crafting <span className="text-cyan-400">Code</span>,
            <br />
            Creating <span className="text-cyan-400">Content</span>.
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto lg:mx-0">
            Welcome to my digital space! I'm a passionate programmer and content creator, dedicated to sharing knowledge, building useful tools, and exploring the world of software development.
          </p>
          <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
            <a 
              href="https://www.youtube.com/c/TipsUNIX" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30"
            >
              <YoutubeIcon className="h-6 w-6" />
              <span>Subscribe on YouTube</span>
            </a>
            <a 
              href="https://lynk.id/tipsunix/740p8lr35mp0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30"
            >
              <UsersIcon className="h-6 w-6" />
              <span>Join Grup Belajar</span>
            </a>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
             <Logo className="w-full h-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;