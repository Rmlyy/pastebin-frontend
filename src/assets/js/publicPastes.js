const tableBody = document
  .getElementById('table')
  .getElementsByTagName('tbody')[0]
const currPageElem = document.getElementById('currPage')
const totalPagesElem = document.getElementById('totalPages')

let currPage = 0
let totalPages = 0
let firstCall = true

async function getPublicPastes(page) {
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild)
  }

  page = parseInt(page) ?? 1
  let res

  try {
    const response = await fetch(`${API_BASE_URL}/getPublicPastes?page=${page}`)
    res = await response.json()
  } catch (e) {
    console.error(e)
    displayError()
    return
  }

  totalPages = res.totalPages
  totalPagesElem.innerText = totalPages

  const pastes = res.pastes
  const tableCells = 4
  const tableCellMap = {
    0: 'id',
    1: 'name',
    2: 'createdAt',
    3: 'expiresAt',
  }

  pastes.forEach((paste) => {
    paste.expiresAt = paste.expiresAt
      ? new Date(paste.expiresAt).toLocaleString()
      : 'never'
    paste.createdAt = new Date(paste.createdAt).toLocaleString()

    const tableRow = tableBody.insertRow()
    const viewCell = tableRow.insertCell(0)
    viewCell.innerHTML = `<a target="_blank" role="button" href="/view/index.html?id=${paste.id}">View</a>`

    for (let i = 0; i < tableCells; i++) {
      const tableCell = tableRow.insertCell(i)

      tableCell.textContent = paste[tableCellMap[i]]
    }
  })
}

async function nextPage() {
  if (!firstCall && currPage === totalPages) return

  currPage += 1
  currPageElem.innerText = currPage
  await getPublicPastes(currPage)
}

async function previousPage() {
  if (currPage === 1) return

  currPage -= 1
  currPageElem.innerText = currPage
  await getPublicPastes(currPage)
}

;(async () => {
  await nextPage()
  firstCall = false
})()
