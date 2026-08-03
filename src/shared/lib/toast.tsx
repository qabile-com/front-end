'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import toast, { Toaster, ToastBar, type Toast } from 'react-hot-toast';

const toastClassName =
  'relative rounded-[18px] border px-6 py-5 text-base font-extrabold leading-8 text-white shadow-[0_24px_80px_-34px_var(--glow)] backdrop-blur-2xl border-hair before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:[background:linear-gradient(90deg,transparent,rgba(243,186,99,.5),transparent)]';

const successToastClassName = `${toastClassName} border-[rgba(255,98,0,.24)]`;
const errorToastClassName = `${toastClassName} border-[rgba(255,90,90,.35)]`;

const baseToastStyle = {
  direction: 'rtl' as const,
  maxWidth: 'min(92vw, 430px)',
  background: 'rgba(30, 18, 12, 0.96)',
  color: '#fff',
  minHeight: '80px',
  height: 'auto',
};

const toastStyle = { ...baseToastStyle };

function DismissibleToast({ currentToast }: { currentToast: Toast }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const dragOffsetRef = useRef(0);

  const dismiss = () => toast.dismiss(currentToast.id);

  useEffect(() => {
    const remainingDuration = Math.max(0, 3000 - (Date.now() - currentToast.createdAt));
    const timeoutId = window.setTimeout(() => toast.dismiss(currentToast.id), remainingDuration);

    return () => window.clearTimeout(timeoutId);
  }, [currentToast.createdAt, currentToast.id]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setDragStart(event.clientX);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart === null) return;
    const nextOffset = event.clientX - dragStart;
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const handlePointerUp = () => {
    if (Math.abs(dragOffsetRef.current) > 90) {
      dismiss();
      return;
    }

    dragOffsetRef.current = 0;
    setDragOffset(0);
    setDragStart(null);
  };

  return (
    <ToastBar
      toast={currentToast}
      style={{
        ...currentToast.style,
        touchAction: 'pan-y',
      }}
    >
      {({ message }) => (
        <div
          className="flex w-full cursor-grab items-center gap-3 active:cursor-grabbing"
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: dragStart === null ? 'transform 160ms ease' : 'none',
            opacity: Math.max(0.55, 1 - Math.abs(dragOffset) / 240),
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="min-w-0 flex-1">{message}</div>
          <button
            type="button"
            aria-label="Close toast"
            className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-lg leading-none text-white/80 transition hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            onClick={dismiss}
            onPointerDown={(event) => event.stopPropagation()}
          >
            x
          </button>
        </div>
      )}
    </ToastBar>
  );
}

export function GlassToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      containerStyle={{ top: 'calc(18px + env(safe-area-inset-top))', zIndex: 2000 }}
      toastOptions={{
        duration: 3000,
        className: toastClassName,
        style: toastStyle,
        success: {
          duration: 3000,
          className: successToastClassName,
          style: toastStyle,
          iconTheme: {
            primary: '#FF6200',
            secondary: '#1A0A00',
          },
        },
        error: {
          duration: 3000,
          className: errorToastClassName,
          style: toastStyle,
          iconTheme: {
            primary: '#FF5A5A',
            secondary: '#1A0A00',
          },
        },
        loading: {
          duration: 3000,
          className: successToastClassName,
          style: toastStyle,
          iconTheme: {
            primary: '#F3BA63',
            secondary: '#1A0A00',
          },
        },
      }}
    >
      {(currentToast) => <DismissibleToast currentToast={currentToast} />}
    </Toaster>
  );
}

export const showSuccess = (message: string) =>
  toast.success(message);

export const showError = (message: string) =>
  toast.error(message);
