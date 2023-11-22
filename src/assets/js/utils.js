const API_BASE_URL = 'https://paste.rmly.dev/api'
const MAX_PASTE_LENGTH = 100000

const errorElem = document.getElementById('error')
const resultElem = document.getElementById('result')
const elems = ['content', 'name', 'password', 'expiry', 'pasteBtn', 'authBtn']
const btnElems = elems.filter((elem) => elem.endsWith('Btn'))
let btnsDefVals = {}

btnElems.forEach((elem) => {
  const getElem = document.getElementById(elem)

  if (getElem) {
    btnsDefVals[elem] = document.getElementById(elem).innerHTML
  }
})

function displayError(msg) {
  msg = msg ?? 'Unknown error, check console for details.'

  errorElem.innerText = msg
  errorElem.style.display = 'block'
}

function displayResult(msg) {
  resultElem.innerHTML = msg
  resultElem.style.display = 'block'
}

function setInProgress(status, msg) {
  msg = msg ?? 'Please wait...'

  elems.forEach((elem) => {
    const getElem = document.getElementById(elem)

    if (getElem) {
      getElem.disabled = status

      if (getElem instanceof HTMLButtonElement) {
        if (status) {
          getElem.setAttribute('aria-busy', true)
          getElem.classList.add('secondary')
          getElem.innerHTML = msg
        } else {
          getElem.setAttribute('aria-busy', false)
          getElem.classList.remove('secondary')
          getElem.innerHTML = btnsDefVals[elem]
        }
      }
    }
  })
}

function getStoredTokens() {
  const storedTokens = localStorage.getItem('tokens')
  const tokensArr = JSON.parse(storedTokens) || []

  return tokensArr
}

function storeToken(id, token) {
  const storedTokens = getStoredTokens()

  storedTokens.push({
    id: id,
    token: token,
  })

  localStorage.setItem('tokens', JSON.stringify(storedTokens))
}

function removeStoredToken(id) {
  const storedTokens = getStoredTokens()
  const updatedTokens = storedTokens.filter((token) => token.id !== id)

  localStorage.setItem('tokens', JSON.stringify(updatedTokens))
}

function formatDate(date) {
  const parsedTimestamp = Date.parse(date)

  if (isNaN(parsedTimestamp)) {
    return date
  }

  const parsedDate = new Date(parsedTimestamp)
  return parsedDate.toLocaleString()
}

function toggleModal(error) {
  const modalElem = document.getElementById('modal')

  if (error) {
    const modalHeaderElem = document.getElementById('modalHeader')
    const modalContentElem = document.getElementById('modalContent')

    modalElem.setAttribute('open', 'true')
    modalHeaderElem.innerText = 'Error'
    modalContentElem.innerText =
      error === 'default'
        ? 'An unknown error has occured. Please try again later'
        : error

    return
  }

  if (modalElem.hasAttribute('open')) {
    modalElem.removeAttribute('open')
  } else {
    modalElem.setAttribute('open', 'true')
  }
}
