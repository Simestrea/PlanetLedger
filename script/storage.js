const Storage = {
  read: function (key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      console.warn('[Storage] 读取失败:', key, err);
      return fallback;
    }
  },

  write: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn('[Storage] 写入失败:', key, err);
      return false;
    }
  },

  remove: function (key) {
    localStorage.removeItem(key);
  },
};
