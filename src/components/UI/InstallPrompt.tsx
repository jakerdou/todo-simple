import React from 'react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

const InstallPrompt: React.FC = () => {
  const { installPrompt, isAppInstalled, showInstallPrompt } = useInstallPrompt();

  if (isAppInstalled || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 mx-4 mb-4 rounded-lg bg-blue-500 p-4 shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 rounded-full bg-white p-2">
            <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
              <path d="M10 6a1 1 0 011 1v3.586l2.707 2.707a1 1 0 11-1.414 1.414l-3-3A1 1 0 019 11V7a1 1 0 011-1z" />
            </svg>
          </div>
          <div className="text-sm text-white">
            <p className="font-semibold">Install Todo Simple</p>
            <p className="text-xs">Add to your home screen for a better experience</p>
          </div>
        </div>
        <div className="flex">
          <button
            onClick={showInstallPrompt}
            className="rounded bg-white px-3 py-1 text-sm font-semibold text-blue-500"
          >
            Install
          </button>
          <button
            onClick={() => {
              const element = document.querySelector('.install-prompt');
              if (element) {
                element.classList.add('hidden');
              }
            }}
            className="ml-2 text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
