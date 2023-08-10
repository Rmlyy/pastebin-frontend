const urlParams = new URLSearchParams(window.location.search)
const pasteId = urlParams.get('id')
const pasteContentElem = document.getElementById('pasteContent')
const pasteNameElem = document.getElementById('pasteName')
const pasteIdElem = document.getElementById('pasteId')
const pasteCreatedAtElem = document.getElementById('pasteCreatedAt')
const pasteExpiresAtElem = document.getElementById('pasteExpiresAt')
const pastePublicElem = document.getElementById('pastePublic')
const fileExts = {
  none: 'txt',
  html: 'html',
  css: 'css',
  javascript: 'js',
  typescript: 'ts',
  java: 'java',
  python: 'py',
  c: 'c',
  csharp: 'cs',
  rust: 'rs',
  go: 'go',
  php: 'php',
  zig: 'zig',
  sql: 'sql',
  markdown: 'md',
  json: 'json',
  yaml: 'yml',
  toml: 'toml',
  regex: 'txt',
  bash: 'sh',
  batch: 'bat',
  powerhsell: 'ps',
}

// TODO: add home button to error modal

function isValidUUID(str) {
  const uuidPattern =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  return uuidPattern.test(str)
}

function escapeHtml(inputString) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return inputString.replace(/[&<>"']/g, (match) => htmlEntities[match])
}

async function getPaste(paste) {
  const reqConf = {
    headers: paste.token ? { Authorization: `Bearer ${paste.token}` } : {},
  }
  let resData = {}

  //console.log(reqConf)
  try {
    let res = await fetch(`${API_BASE_URL}/getPaste?id=${paste.id}`, reqConf)

    resData.status = res.status
    res = await res.json()
    resData.paste = res

    return resData
  } catch (e) {
    console.error(e)
    toggleModal('default')
  }
}

function dl() {
  const pasteContent = document.getElementById('pasteContent').textContent
  const pasteName = document.getElementById('pasteName').textContent
  const pasteLang = document.getElementById('lang').value

  const blob = new Blob([pasteContent], { type: 'text/plain' })
  const blobURL = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = blobURL
  anchor.download = `${pasteName}.${fileExts[pasteLang]}`
  anchor.click()

  URL.revokeObjectURL(blobURL)
}

;(async () => {
  if (!pasteId || !isValidUUID(pasteId)) {
    window.location.href = '/'
    return
  }

  toggleModal()

  const storedTokens = getStoredTokens()
  const foundToken = storedTokens.find((token) => token.id === pasteId) || false
  let res

  try {
    res = await getPaste({
      id: pasteId,
      token: foundToken.token,
    })

    const authPath = `/auth/index.html?id=${pasteId}`

    if (foundToken && res.paste?.message?.includes('invalid token')) {
      removeStoredToken(pasteId)
      window.location.href = authPath
      //console.log('redirect to auth path, found token')
      return
    }

    if (res.paste.message && res.paste.message.includes('password')) {
      window.location.href = authPath
      //console.log('redirect to auth path, password')
      return
    }

    if (res.status !== 200) {
      window.location.href = '/'
      return
    }

    pasteNameElem.innerText = res.paste.name
    pasteIdElem.innerText = res.paste.id
    pasteCreatedAtElem.innerText = formatDate(res.paste.createdAt)
    pasteExpiresAtElem.innerText = formatDate(res.paste.expiresAt) || 'never'
    pastePublicElem.innerText = res.paste.public ? 'yes' : 'no'
    pasteContentElem.innerHTML = escapeHtml(res.paste.content)
    syntaxHighlight()

    toggleModal()
  } catch (e) {
    console.error(e)
    toggleModal('default')
  }
})()
