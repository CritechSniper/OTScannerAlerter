// Safety features
    document.addEventListener('keydown', function (e) {
    // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, F12
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.key === 'F12')
      ) {
        e.preventDefault();
        window.location.href = "https://www.google.com/search?q=You+have+been+blocked"
      }
    });
