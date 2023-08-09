function syntaxHighlight() {
  const selectedValue = document.getElementById('lang').value

  pasteContentElem.className = `language-${selectedValue}`
  Prism.highlightAll()
}
