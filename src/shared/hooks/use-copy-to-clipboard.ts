'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type CopyStatus = 'idle' | 'copied' | 'failed';

interface UseCopyToClipboardOptions {
  resetAfterMs?: number;
}

export function useCopyToClipboard({ resetAfterMs = 1600 }: UseCopyToClipboardOptions = {}) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const resetTimerRef = useRef<number | null>(null);

  const resetLater = useCallback(() => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setStatus('idle');
      resetTimerRef.current = null;
    }, resetAfterMs);
  }, [resetAfterMs]);

  const copy = useCallback(
    async (text: string) => {
      try {
        await copyText(text);
        setStatus('copied');
        resetLater();
        return true;
      } catch {
        setStatus('failed');
        resetLater();
        return false;
      }
    },
    [resetLater],
  );

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return {
    copy,
    status,
    copied: status === 'copied',
    failed: status === 'failed',
  };
}

async function copyText(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.insetInlineStart = '-9999px';
  textarea.style.top = '0';

  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('Copy failed');
  }
}
