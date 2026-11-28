export const THEME_STORAGE_KEY = "theme";

// Runs before React starts, so the saved theme is on <html> for the first paint.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;
