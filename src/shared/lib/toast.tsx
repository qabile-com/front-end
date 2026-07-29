'use client';

import toast, { Toaster } from 'react-hot-toast';

const toastClassName =
  'relative overflow-hidden rounded-[18px] border px-4 py-3 text-sm font-extrabold leading-7 text-[var(--color-ink)] shadow-[0_24px_80px_-34px_var(--glow),0_0_0_1px_rgba(255,255,255,.035)_inset] backdrop-blur-2xl [background:linear-gradient(135deg,rgba(24,11,4,.94),rgba(7,4,2,.94))] before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:[background:linear-gradient(90deg,transparent,rgba(243,186,99,.65),transparent)]';

const successToastClassName = `${toastClassName} border-[rgba(255,98,0,.34)]`;
const errorToastClassName = `${toastClassName} border-[rgba(255,90,90,.42)]`;

const toastStyle = {
  direction: 'rtl' as const,
  maxWidth: 'min(92vw, 430px)',
};

export function GlassToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      containerStyle={{ top: 18, zIndex: 120 }}
      toastOptions={{
        duration: 4200,
        className: toastClassName,
        style: toastStyle,
        success: {
          className: successToastClassName,
          style: toastStyle,
          iconTheme: {
            primary: '#FF6200',
            secondary: '#1A0A00',
          },
        },
        error: {
          duration: 5600,
          className: errorToastClassName,
          style: toastStyle,
          iconTheme: {
            primary: '#FF5A5A',
            secondary: '#1A0A00',
          },
        },
        loading: {
          className: successToastClassName,
          style: toastStyle,
          iconTheme: {
            primary: '#F3BA63',
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
