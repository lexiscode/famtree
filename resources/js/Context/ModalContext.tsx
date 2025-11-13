import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isCtaModalOpen: boolean;
  ctaModalTab: 'login' | 'register';
  openCtaModal: (tab?: 'login' | 'register') => void;
  closeCtaModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isCtaModalOpen, setIsCtaModalOpen] = useState(false);
  const [ctaModalTab, setCtaModalTab] = useState<'login' | 'register'>('login');

  const openCtaModal = (tab: 'login' | 'register' = 'login') => {
    setCtaModalTab(tab);
    setIsCtaModalOpen(true);
  };

  const closeCtaModal = () => {
    setIsCtaModalOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        isCtaModalOpen,
        ctaModalTab,
        openCtaModal,
        closeCtaModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
