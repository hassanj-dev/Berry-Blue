// Runs in <head> before React. Dark is the default. Only an explicit "light" choice switches it.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}})();`;
