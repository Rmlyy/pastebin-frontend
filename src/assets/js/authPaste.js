const urlParams = new URLSearchParams(window.location.search)
const pasteId = urlParams.get('id')
const pastePasswordElem = document.getElementById('password')
const authBtnElem = document.getElementById('authBtn')

document.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    authBtn.click()
  }
})

function isValidUUID(str) {
  const uuidPattern =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  return uuidPattern.test(str)
}

async function getPasteInfo(pasteId) {
  let resData = {}

  try {
    let res = await fetch(`${API_BASE_URL}/getPasteInfo?id=${pasteId}`)

    resData.status = res.status
    res = await res.json()
    resData.paste = res

    return resData
  } catch (e) {
    console.error(e)
    toggleModal('default')
  }
}

async function generateToken(pasteId, password) {
  const reqBody = {
    id: pasteId,
  }

  const reqConfig = {
    method: 'post',
    body: JSON.stringify(reqBody),
    headers: {
      'Content-Type': 'application/json',
      Authorization: password,
    },
  }

  const res = await fetch(`${API_BASE_URL}/generateToken`, reqConfig)
  const data = await res.json()

  if (data.message?.includes('password')) {
    displayError('Invalid password.')
    toggleModal()
    return
  }

  if (!res.ok) {
    console.log(res)
    toggleModal('default')
    return
  }

  storeToken(pasteId, data.token)

  window.location.href = `/view/index.html?id=${pasteId}`
}

async function auth() {
  if (!pastePasswordElem.value) {
    displayError(`You must enter a password`)
    return
  }

  setInProgress(true)
  try {
    await generateToken(pasteId, pastePasswordElem.value)
    toggleModal()
  } catch (e) {
    console.error(e)
    toggleModal('default')
  } finally {
    setInProgress(false)
  }
}

;(async () => {
  if (!pasteId || !isValidUUID(pasteId)) {
    window.location.href = '/'
    return
  }

  const storedTokens = getStoredTokens()
  const foundToken = storedTokens.find((token) => token.id === pasteId) || false

  if (foundToken) {
    window.location.href = `/view/index.html?id=${pasteId}`
    return
  }

  toggleModal()
  try {
    const res = await getPasteInfo(pasteId)

    if (res.status !== 200 && !res.paste.passworded) {
      window.location.href = '/'
      return
    }

    toggleModal()
  } catch (e) {
    console.error(e)
    toggleModal('default')
  }
})()
