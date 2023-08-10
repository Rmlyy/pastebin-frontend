const pasteContentElem = document.getElementById('content')
const pasteNameElem = document.getElementById('name')
const pastePassElem = document.getElementById('password')
const pasteExpiryElem = document.getElementById('expiry')
const pastePublicElem = document.getElementById('public')

document.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    pasteBtnElem.click()
  }
})

async function createPaste() {
  if (!pasteContentElem.value) {
    displayError("Your paste's content cannot be empty.")
    return
  }

  if (pasteContentElem.value.length > MAX_PASTE_LENGTH) {
    displayError(
      `Your paste's content cannot be greater than ${MAX_PASTE_LENGTH} characters.`
    )
    return
  }

  const reqBody = {
    name: pasteNameElem?.value,
    content: pasteContentElem.value,
    password: pastePassElem?.value,
    expiresIn: pasteExpiryElem.value,
    token: true,
    public: pastePublicElem.checked,
  }

  const reqConf = {
    method: 'post',
    body: JSON.stringify(reqBody),
    headers: {
      'Content-Type': 'application/json',
    },
  }

  let newPaste
  setInProgress(true)

  try {
    newPaste = await fetch(`${API_BASE_URL}/createPaste`, reqConf)

    if (!newPaste.ok) {
      console.log(newPaste)
      displayError()
      return
    }

    newPaste = await newPaste.json()
  } catch (e) {
    console.error(e)
    displayError()
  } finally {
    setInProgress(false)
  }

  if (newPaste.passworded) {
    storeToken(newPaste.id, newPaste.token)
  }

  const pastePath = `/view/index.html?id=${newPaste.id}`

  if (newPaste.expiresAt === 'one-time') {
    displayResult(
      `Your paste has been created: <a style="color: white" href="${pastePath}">${pastePath}</a>`
    )

    setInProgress(true, 'Please wait before making another paste.')
    setTimeout(() => {
      setInProgress(false)
    }, 15 * 1000)
    return
  }

  window.location.href = pastePath
}
