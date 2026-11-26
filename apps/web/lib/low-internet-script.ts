export const LOW_INTERNET_ATTR = "data-low-internet";

// Runs in <head> before the page is painted. Fully automatic:
// Data Saver or a 3g-or-slower connection turns the mode on.
export const lowInternetInitScript = `(function(){try{var c=navigator.connection;if(c&&(c.saveData===true||c.effectiveType==="3g"||c.effectiveType==="2g"||c.effectiveType==="slow-2g")){document.documentElement.setAttribute("${LOW_INTERNET_ATTR}","")}}catch(e){}})();`;
