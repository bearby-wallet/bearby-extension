export async function clipboardCopy(text: string) {
  // Put the text to copy into a <span>
  const span = document.createElement('span');
  span.style.display = 'none';

  // Preserve consecutive spaces and newlines
  span.style.height = '1px';
  span.style.width = '1px';
  span.style.whiteSpace = 'pre';
  span.style.userSelect = 'all';

  span.textContent = text;

  span.style.display = 'block';

  // Add the <span> to the page
  document.body.appendChild(span);

  // Make a selection object representing the range of text selected by the user
  const selection = window.getSelection();
  if (selection) {
    const range = window.document.createRange();
    selection.removeAllRanges();
    range.selectNode(span);
    selection.addRange(range);
  
    // Copy text to the clipboard
    try {
      window.document.execCommand('copy');
    } finally {
      // Cleanup
      selection.removeAllRanges();
      window.document.body.removeChild(span);
    }
  }
}
