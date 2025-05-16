import React, { useEffect, useState } from 'react';

interface SafeAreaInsetStyle {
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
}

const IOSDetector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [insetStyle, setInsetStyle] = useState<SafeAreaInsetStyle>({});

  useEffect(() => {
    // Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod|mac/.test(userAgent);
    setIsIOS(isApple);

    // Apply safe area insets for iOS
    if (isApple) {
      const style = {
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      };
      setInsetStyle(style);
      
      // Add viewport-fit meta tag for iOS notch support
      const metaTag = document.createElement('meta');
      metaTag.name = 'viewport';
      metaTag.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
      document.head.appendChild(metaTag);
      
      // Add a class to the body for iOS-specific styling
      document.body.classList.add('ios-device');
    }
  }, []);

  // Apply safe area insets to the top-level container
  return (
    <div className={`ios-container ${isIOS ? 'ios-device' : ''}`} style={insetStyle}>
      {children}
    </div>
  );
};

export default IOSDetector;
