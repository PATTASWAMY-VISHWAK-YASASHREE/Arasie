const GOOGLE_IDENTITY_SRC = 'https://accounts.google.com/gsi/client';

let loaderPromise = null;
let tokenClient = null;

const ensureWindow = () => {
  if (typeof window === 'undefined') {
    throw new Error('Google Identity Services requires a browser environment.');
  }
};

export const loadGoogleIdentity = () => {
  ensureWindow();

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google.accounts.oauth2);
  }

  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_IDENTITY_SRC}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google?.accounts?.oauth2));
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')));
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_IDENTITY_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google?.accounts?.oauth2);
      script.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
      document.head.appendChild(script);
    });
  }

  return loaderPromise;
};

export const initializeTokenClient = async ({ clientId, scope, onTokenResponse, onError }) => {
  const oauth2 = await loadGoogleIdentity();
  if (!oauth2) {
    throw new Error('Google Identity Services library not available.');
  }

  tokenClient = oauth2.initTokenClient({
    client_id: clientId,
    scope,
    callback: (response) => {
      if (response?.access_token) {
        onTokenResponse?.(response);
      } else if (response?.error) {
        onError?.(new Error(response.error));
      } else {
        onError?.(new Error('Unknown token response.'));
      }
    }
  });

  return tokenClient;
};

export const requestAccessToken = async ({ prompt = '', onTokenResponse, onError } = {}) => {
  ensureWindow();

  if (!tokenClient) {
    throw new Error('Token client has not been initialized. Call initializeTokenClient first.');
  }

  return new Promise((resolve, reject) => {
    const handleSuccess = (tokenResponse) => {
      onTokenResponse?.(tokenResponse);
      resolve(tokenResponse);
    };

    const handleError = (error) => {
      const formattedError = error instanceof Error ? error : new Error(error?.error || 'Failed to obtain access token.');
      onError?.(formattedError);
      reject(formattedError);
    };

    tokenClient.callback = (response) => {
      if (response?.access_token) {
        handleSuccess(response);
      } else {
        handleError(response);
      }
    };

    try {
      tokenClient.requestAccessToken({ prompt });
    } catch (err) {
      handleError(err);
    }
  });
};

export const revokeAccess = async (token) => {
  ensureWindow();

  if (!window.google?.accounts?.oauth2?.revoke) {
    throw new Error('Google Identity Services revoke API unavailable.');
  }

  return new Promise((resolve) => {
    window.google.accounts.oauth2.revoke(token, () => {
      resolve();
    });
  });
};

export const hasGrantedAllScopes = (tokenResponse, scope) => {
  if (!window.google?.accounts?.oauth2?.hasGrantedAllScopes) {
    return false;
  }
  return window.google.accounts.oauth2.hasGrantedAllScopes(tokenResponse, scope);
};

export const resetTokenClient = () => {
  tokenClient = null;
  loaderPromise = null;
};

export default {
  loadGoogleIdentity,
  initializeTokenClient,
  requestAccessToken,
  revokeAccess,
  hasGrantedAllScopes,
  resetTokenClient
};
