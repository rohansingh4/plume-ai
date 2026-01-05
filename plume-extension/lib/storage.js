// lib/storage.js
// Shared storage utilities for Plume extension

const PlumeStorage = {
  async get(key) {
    const result = await chrome.storage.local.get(key);
    return result[key];
  },

  async set(key, value) {
    await chrome.storage.local.set({ [key]: value });
  },

  async getState() {
    return await this.get('plumeState') || {};
  },

  async setState(updates) {
    const current = await this.getState();
    await this.set('plumeState', { ...current, ...updates });
  },

  async clearAll() {
    await chrome.storage.local.clear();
  }
};

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.PlumeStorage = PlumeStorage;
}
