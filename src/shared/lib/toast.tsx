'use client';

import toast, { Toaster } from 'react-hot-toast';

const toastClassName =
  'relative overflow-hidden rounded-[18px] border px-4 py-3 text-sm font-extrabold leading-7 text-[var(--color-ink)] shadow-[0_24px_80px_-34px_var(--glow)] backdrop-blur-2xl border-hair [background:rgba(14,8,6,.92)] before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:[background:linear-gradient(90deg,transparent,rgba(243,186,99,.5),transparent)]';

const successToastClassName = `${toastClassName} border-[rgba(255,98,0,.24)]`;
const errorToastClassName = `${toastClassName} border-[rgba(255,90,90,.35)]`;

const toastStyle = {
  direction: 'rtl' as const,
  maxWidth: 'min(92vw, 430px)',
};

export function GlassToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      containerStyle={{ top: 'calc(18px + env(safe-area-inset-top))', zIndex: 120 }}
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
