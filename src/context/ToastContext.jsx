import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);

  const toast = useCallback((text) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2400);
  }, []);

  return <ToastCtx.Provider value={{ msg, toast }}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  return useContext(ToastCtx).toast;
}

export function useToastMessage() {
  return useContext(ToastCtx).msg;
}
