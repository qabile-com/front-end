'use client';

import { useEffect } from 'react';
import { tryDevAutoLogin } from './dev-bypass';

export function DevAuthInitializer() {
  useEffect(() => {
    tryDevAutoLogin();
  }, []);

  return null;
}
