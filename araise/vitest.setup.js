import { vi } from 'vitest';

class LocalStorageMock {
  constructor() {
    this.store = new Map();
  }

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key) {
    const value = this.store.get(String(key));
    return value === undefined ? null : value;
  }

  setItem(key, value) {
    this.store.set(String(key), String(value));
  }

  removeItem(key) {
    this.store.delete(String(key));
  }

  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new LocalStorageMock();
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
}

if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = vi.fn(() => Promise.reject(new Error('fetch not mocked')));
}
