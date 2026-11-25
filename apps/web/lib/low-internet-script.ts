export const LOW_INTERNET_KEY = "low-internet";
export const LOW_INTERNET_ATTR = "data-low-internet";

// Runs in <head> before the page is painted. Order of decisions:
// 1. the visitor's own choice ("on" or "off") wins,
// 2. otherwise Save-Data or a 2g connection turns the mode on.
export const lowInternetInitScript = `(function(){var on=false;try{var s=localStorage.getItem("${LOW_INTERNET_KEY}");if(s==="on"){on=true}else if(s!=="off"){var c=navigator.connection;on=!!c&&(c.saveData===true||c.effectiveType==="2g"||c.effectiveType==="slow-2g")}}catch(e){}if(on){document.documentElement.setAttribute("${LOW_INTERNET_ATTR}","")}})();`;
