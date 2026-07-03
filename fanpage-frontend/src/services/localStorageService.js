const localStorageService = {
  get(key, defaultValue = null) {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return defaultValue;

    try {
      return JSON.parse(rawValue);
    } catch (error) {
      return defaultValue;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  }
};

export default localStorageService;
