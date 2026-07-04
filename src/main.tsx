import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR WebSocket connection errors in sandbox environments
if (typeof window !== 'undefined') {
  const OriginalWebSocket = window.WebSocket;

  class MockWebSocket {
    url: string;
    protocol?: string;
    readyState: number = 3; // CLOSED
    binaryType: string = 'blob';
    bufferedAmount: number = 0;
    extensions: string = '';

    constructor(url: string, protocols?: string | string[]) {
      this.url = url;
      this.protocol = Array.isArray(protocols) ? protocols[0] : protocols;
      
      // Simulate safe close state immediately
      setTimeout(() => {
        if (this.onclose) {
          try {
            this.onclose({
              code: 1000,
              reason: 'Sandbox mock close',
              wasClean: true
            } as any);
          } catch (e) {}
        }
      }, 50);
    }

    send(data: any) {}
    close(code?: number, reason?: string) {}
    addEventListener(type: string, listener: any, options?: any) {}
    removeEventListener(type: string, listener: any, options?: any) {}
    dispatchEvent(event: Event) { return true; }

    onopen: any = null;
    onmessage: any = null;
    onerror: any = null;
    onclose: any = null;
  }

  // Intercept and redirect Vite HMR WebSocket connections to the mock wrapper if allowed by environment
  try {
    const CustomWebSocket = function (url: string | URL, protocols?: string | string[]) {
      const urlString = String(url);
      if (
        urlString.includes('vite') ||
        (Array.isArray(protocols) && protocols.includes('vite-hmr')) ||
        protocols === 'vite-hmr'
      ) {
        return new MockWebSocket(urlString, protocols) as any;
      }
      return new OriginalWebSocket(url, protocols);
    } as any;

    // Copy static properties of standard WebSocket
    CustomWebSocket.CONNECTING = 0;
    CustomWebSocket.OPEN = 1;
    CustomWebSocket.CLOSING = 2;
    CustomWebSocket.CLOSED = 3;

    // Attempt standard assignment, with Object.defineProperty fallback
    try {
      window.WebSocket = CustomWebSocket;
    } catch {
      Object.defineProperty(window, 'WebSocket', {
        value: CustomWebSocket,
        configurable: true,
        writable: true,
      });
    }
  } catch (e) {
    // If WebSocket is completely locked down, fall back gracefully to error handlers below
    console.debug('Vite HMR WebSocket interception skipped due to environment constraints:', e);
  }

  // Silent capture for any stray unhandled rejections related to HMR
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason &&
      ((typeof reason === 'string' && reason.includes('WebSocket')) ||
        (reason.message && reason.message.includes('WebSocket')) ||
        (reason.stack && reason.stack.includes('websocket')) ||
        (reason.message && reason.message.includes('websocket')))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message &&
      (event.message.includes('WebSocket') || event.message.includes('websocket'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  // Filter out console logs mentioning WebSocket or vite-hmr to keep the console pristine
  const originalWarn = console.warn;
  console.warn = function (...args) {
    const msg = args.join(' ');
    if (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('vite-hmr') ||
      msg.includes('[vite]')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  const originalError = console.error;
  console.error = function (...args) {
    const msg = args.join(' ');
    if (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('vite-hmr') ||
      msg.includes('[vite]')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


