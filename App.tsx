import React, { useState } from 'react';
// Dynamically import the tool components
const Header = React.lazy(() => import('./components/Header'));
const HeroSection = React.lazy(() => import('./components/HeroSection'));
const ToolsSection = React.lazy(() => import('./components/ToolsSection'));
const Footer = React.lazy(() => import('./components/Footer'));
const CodeExplainerPage = React.lazy(() => import('./pages/CodeExplainerPage'));
const PromptGeneratorPage = React.lazy(() => import('./pages/PromptGeneratorPage'));
const MetadataGeneratorPage = React.lazy(() => import('./pages/MetadataGeneratorPage'));
const SocialMediaPostGeneratorPage = React.lazy(() => import('./pages/SocialMediaPostGeneratorPage'));
const UnixCommandGeneratorPage = React.lazy(() => import('./pages/UnixCommandGeneratorPage'));
const ApiKeyManager = React.lazy(() => import('./components/ApiKeyManager'));
const ViralVideoGeneratorPage = React.lazy(() => import('./pages/ViralVideoGeneratorPage'));


const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const handleSelectTool = (tool: string | null) => {
    setActiveTool(tool);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const renderContent = () => {
    switch (activeTool) {
      case 'code-explainer':
        return <CodeExplainerPage />;
      case 'prompt-generator':
        return <PromptGeneratorPage />;
      case 'metadata-generator':
        return <MetadataGeneratorPage />;
      case 'social-media-post':
        return <SocialMediaPostGeneratorPage />;
      case 'unix-command':
        return <UnixCommandGeneratorPage />;
      case 'viral-video-generator':
        return <ViralVideoGeneratorPage />;
      default:
        return (
          <>
            <HeroSection />
            <ToolsSection onSelectTool={handleSelectTool} />
          </>
        );
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen font-sans antialiased">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.05] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          activeTool={activeTool} 
          onBack={() => handleSelectTool(null)}
          onOpenSettings={() => setApiKeyModalOpen(true)}
        />
        <main className="flex-grow">
          {renderContent()}
        </main>
        <Footer />
        <ApiKeyManager 
          isOpen={isApiKeyModalOpen} 
          onClose={() => setApiKeyModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;