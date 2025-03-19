/**
 * This utility helps scan the codebase for potentially non-internationalized text
 * Usage: Import and call this function in development to check for hard-coded strings
 */

export function checkForNonI18nText() {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('=== i18n Check Tool ===');
  console.log('This utility helps identify potential hard-coded text that might need internationalization');
  console.log('Checking current page for potential non-internationalized text...');
  
  // Find all text nodes in the page
  const textNodes = [];
  const walk = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Filter out empty text nodes and text inside scripts
        if (
          node.parentNode.nodeName === 'SCRIPT' ||
          node.parentNode.nodeName === 'STYLE' ||
          !node.nodeValue.trim()
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  while (walk.nextNode()) {
    const text = walk.currentNode.nodeValue.trim();
    if (text.length > 3) { // Ignore very short text
      textNodes.push({
        text,
        element: walk.currentNode.parentNode
      });
    }
  }
  
  console.log(`Found ${textNodes.length} text nodes that might need internationalization:`);
  textNodes.forEach((node, index) => {
    console.log(`${index + 1}. "${node.text}" in <${node.element.tagName.toLowerCase()}>`);
  });
  
  console.log('\nTo properly internationalize your app:');
  console.log('1. Replace hard-coded text with translation keys: {t("key")}');
  console.log('2. Add the keys to your locales files (en.json, es.json, etc.)');
  console.log('=== End of i18n Check ===');
}
