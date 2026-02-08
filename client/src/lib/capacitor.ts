import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

export const isNativePlatform = Capacitor.isNativePlatform();

let backButtonCallback: (() => boolean) | null = null;

export function setBackButtonHandler(handler: (() => boolean) | null) {
  backButtonCallback = handler;
}

export async function initCapacitor() {
  if (!isNativePlatform) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1a1625' });
  } catch {}

  try {
    await SplashScreen.hide();
  } catch {}

  try {
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch {}

  App.addListener('backButton', ({ canGoBack }) => {
    if (backButtonCallback) {
      const handled = backButtonCallback();
      if (handled) return;
    }
    if (canGoBack) {
      window.history.back();
    } else {
      App.minimizeApp();
    }
  });
}
