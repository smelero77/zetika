export function ThemeScript() {
  const script = `
    (function() {
      var storageKey = 'theme';
      var theme;
      try {
        theme = localStorage.getItem(storageKey);
      } catch (e) {}
      
      if (theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      } else {
        var media = window.matchMedia('(prefers-color-scheme: dark)');
        document.documentElement.classList.toggle('dark', media.matches);
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
} 