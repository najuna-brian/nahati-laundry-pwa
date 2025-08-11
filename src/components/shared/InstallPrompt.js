import React, { useState, useEffect } from 'react';

const InstallPrompt = ({ onInstall, onDismiss }) => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showPrompt, setShowPrompt] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    // Water bubble animation component
    const WaterBubble = ({ delay = 0, duration = 3, size = 'w-3 h-3', position = 'top-10 left-10' }) => (
        <div 
            className={`absolute ${position} ${size} bg-blue-200 rounded-full opacity-30 animate-pulse`}
            style={{
                animation: `bubble ${duration}s ease-in-out ${delay}s infinite alternate`,
            }}
        ></div>
    );

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true);
            return;
        }

        // Check if PWA is already installed
        if (localStorage.getItem('pwa-installed') === 'true') {
            setIsInstalled(true);
            return;
        }

        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Listen for beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            // Android/Chrome installation
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                localStorage.setItem('pwa-installed', 'true');
                setIsInstalled(true);
                onInstall && onInstall();
            }
            
            setDeferredPrompt(null);
        } else if (isIOS) {
            // Show iOS instructions
            setShowInstructions(true);
        } else {
            // Fallback - mark as dismissed
            handleDismiss();
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        onDismiss && onDismiss();
    };

    const handleInstallCompleted = () => {
        localStorage.setItem('pwa-installed', 'true');
        setIsInstalled(true);
        setShowPrompt(false);
        onInstall && onInstall();
    };

    if (!showPrompt || isInstalled || isStandalone) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Add CSS keyframes for bubble animation */}
            <style>
                {`
                    @keyframes bubble {
                        0% { transform: translateY(0px) scale(0.8); opacity: 0.3; }
                        50% { transform: translateY(-20px) scale(1); opacity: 0.6; }
                        100% { transform: translateY(-40px) scale(0.9); opacity: 0.2; }
                    }
                `}
            </style>
            
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden">
                {/* Water bubble animations */}
                <WaterBubble delay={0} duration={4} size="w-2 h-2" position="top-6 left-8" />
                <WaterBubble delay={1} duration={3.5} size="w-3 h-3" position="top-12 right-12" />
                <WaterBubble delay={0.5} duration={4.5} size="w-1.5 h-1.5" position="top-20 left-20" />
                <WaterBubble delay={2} duration={3} size="w-2.5 h-2.5" position="bottom-20 right-8" />
                <WaterBubble delay={1.5} duration={4} size="w-2 h-2" position="bottom-32 left-6" />
                
                {/* Header with logo and tagline */}
                <div className="text-center mb-6">
                    <img 
                        src="/icons/default-monochrome-white.svg" 
                        alt="Nahati Logo" 
                        className="h-32 w-auto mx-auto mb-4 bg-blue-600 p-4 rounded-2xl"
                    />
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">NAHATI</h1>
                        <p className="text-gray-600 text-lg font-medium">Your Anytime Laundry</p>
                    </div>
                </div>

                {/* Installation Instructions (when needed) */}
                {showInstructions && (
                    <div className="bg-blue-50 rounded-2xl p-6 mb-6 text-left">
                        {isIOS ? (
                            <div>
                                <h3 className="text-lg font-bold mb-4 text-center text-blue-900">📱 Installing on iPhone...</h3>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-xl p-4">
                                        <div className="flex items-center mb-2">
                                            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                                            <span className="font-semibold text-blue-900">Look at the bottom of your screen</span>
                                        </div>
                                        <p className="text-sm ml-11 text-blue-700">Tap the Share button ⬆️ (square with arrow pointing up)</p>
                                    </div>
                                    
                                    <div className="bg-white rounded-xl p-4">
                                        <div className="flex items-center mb-2">
                                            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                                            <span className="font-semibold text-blue-900">Find "Add to Home Screen"</span>
                                        </div>
                                        <p className="text-sm ml-11 text-blue-700">Scroll down and tap "Add to Home Screen" 📱</p>
                                    </div>
                                    
                                    <div className="bg-white rounded-xl p-4">
                                        <div className="flex items-center mb-2">
                                            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                                            <span className="font-semibold text-blue-900">Confirm installation</span>
                                        </div>
                                        <p className="text-sm ml-11 text-blue-700">Tap "Add" in the top right corner ✅</p>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleInstallCompleted}
                                    className="w-full mt-6 bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                                >
                                    ✅ I've installed the app!
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-bold mb-4 text-center text-blue-900">📱 Installing on Android...</h3>
                                <div className="space-y-3">
                                    <p className="text-blue-700">1. Tap the menu (⋮) in your browser</p>
                                    <p className="text-blue-700">2. Look for "Add to Home Screen" or "Install App"</p>
                                    <p className="text-blue-700">3. Tap "Install" or "Add"</p>
                                </div>
                                
                                <button
                                    onClick={handleInstallCompleted}
                                    className="w-full mt-6 bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                                >
                                    ✅ I've installed the app!
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main content when not showing instructions */}
                {!showInstructions && (
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                            Welcome to Nahati! 🧺
                        </h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Install our app for the best laundry experience - faster access, offline support, and instant notifications!
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={handleInstall}
                                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                {deferredPrompt ? '📱 Install App' : isIOS ? '📱 Install on iPhone' : '📱 Install App'}
                            </button>
                            
                            <button
                                onClick={handleDismiss}
                                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Continue in browser
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            Free • No account required • Works offline
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstallPrompt;