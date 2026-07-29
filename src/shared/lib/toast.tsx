'use client';

import toast, { Toaster } from 'react-hot-toast';

const toastClassName =
  'border border-[rgba(255,98,0,.24)] bg-[rgba(15,8,4,.86)] text-[#FDEEE2] shadow-[0_22px_70px_-28px_rgba(255,98,0,.75)] backdrop-blur-2xl';

export function GlassToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 4200,
        className: toastClassName,
        style: {
          borderRadius: '16px',
          padding: '12px 14px',
          fontWeight: 800,
          direction: 'rtl',
          lineHeight: 1.8,
          maxWidth: 'min(92vw, 420px)',
        },
        success: {
          iconTheme: {
            primary: '#FF6200',
            secondary: '#1A0A00',
          },
        },
        error: {
          iconTheme: {
            primary: '#FF6B4A',
            secondary: '#1A0A00',
          },
        },
      }}
    />
  );
}

export const showSuccess = (message: string) =>
  toast.success(message, {
    icon: '✓',
  });

export const showError = (message: string) =>
  toast.error(message, {
    icon: '×',
  });
