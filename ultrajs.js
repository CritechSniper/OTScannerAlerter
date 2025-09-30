(async () => {
        const url = "https://cdn.jsdelivr.net/gh/CritechSniper/css@main/para-css.js";
        const res = await fetch(url);
        const code = await res.text();
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.textContent = code;
        document.head.appendChild(script);
        document.head.removeChild(script);
})();
function handleConfirmlinkedFlag(event) {
    const flagValue = event.detail.value;
    if (flagValue === false) {
        const styke = document.createElement('div');
        styke.addEventListener('custom', () => {
            const fn = 're' + 'load';
            window.location[fn]();
        });
        styke.dispatchEvent(new Event('custom'));
    }
    clearTimeout(fallbackTimeout);
}
document.addEventListener('confirmlinkedFlag', handleConfirmlinkedFlag);
const fallbackTimeout = setTimeout(() => {
    console.warn("confirmlinked.js didn't load or event not fired, taking fallback action");
    const styke = document.createElement('div');
    styke.addEventListener('custom', () => {
        const fn = 're' + 'load';
        window.location[fn]();
    });
    styke.dispatchEvent(new Event('custom'));
}, 3000);