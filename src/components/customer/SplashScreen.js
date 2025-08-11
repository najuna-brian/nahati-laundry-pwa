import React, { useEffect, useState } from 'react';

const SplashScreen = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center text-white transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Logo */}
      <div className="mb-8 animate-pulse-slow">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
            <svg 
              className="w-16 h-16 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h10a1 1 0 100-2H5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 fade-in">
        Nahati
      </h1>
      <h2 className="text-xl md:text-2xl font-light text-center mb-8 fade-in">
        Anytime Laundry
      </h2>

      {/* Slogan */}
      <p className="text-lg md:text-xl text-center mb-12 px-6 fade-in italic">
        "Washing is a basic need."
      </p>

      {/* Loading Animation */}
      <div className="relative">
        <div className="w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="w-4 h-4 bg-white rounded-full animate-ping absolute top-0 left-0"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-ping absolute top-0 right-0 animation-delay-200"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-ping absolute bottom-0 left-0 animation-delay-400"></div>
            <div className="w-4 h-4 bg-white rounded-full animate-ping absolute bottom-0 right-0 animation-delay-600"></div>
          </div>
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-sm opacity-75">v1.0.0</p>
      </div>

      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;