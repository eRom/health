/**
 * Inline blocking script to prevent FOUC (Flash of Unstyled Content)
 * for theme style selection.
 *
 * This script runs before React hydration to immediately apply the
 * theme style from localStorage by setting the data-style attribute
 * on the document element.
 *
 * IMPORTANT: This must be a blocking script in <head> to prevent FOUC.
 */
export function ThemeStyleScript() {
  // Minified inline script to prevent FOUC
  const script = `
    (function() {
      try {
        const storageKey = 'health-theme-style';
        const defaultStyle = 'default';
        const validStyles = ['default', 'amber', 'perpetuity', 'notebook', 'bubblegum'];

        const stored = localStorage.getItem(storageKey);
        const style = stored && validStyles.includes(stored) ? stored : defaultStyle;

        document.documentElement.setAttribute('data-style', style);
      } catch (e) {
        // Silently fail if localStorage is not available
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: script,
      }}
    />
  )
}
