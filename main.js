const container = document.getElementById('container')
const booksList = document.getElementById('books-list')
const searchButton = document.getElementById('search')
const input = document.getElementById('input')
const title = document.getElementById('title')
const paginationTemplate = document.getElementById('template')

// { 1 }
// Función que procesa la búsqueda solicitada desde el navbar.
const executeSearch = async(search, page = 1) => {
    const formattedSearch = search.trim().replaceAll(' ', '-')
    if (formattedSearch === '') return
    
    title.textContent = 'Cargando...'
    const url = getFormattedSearch(formattedSearch, page)
    const data = await getBooksData(url)
    if (data) {
        renderBooks(data, url, data.total, formattedSearch, page)
    }
    // Se despeja la barra de búsqueda.
    input.value = ''
}

const getFormattedSearch = (search, page) => {
    return `https://api.itbook.store/1.0/search/${search}/${page}`
}

// { 2 }
// Realizamos el fetch de la api con nuestra url dinámica.
const getBooksData = async(url) => {
    try {
        const response = await fetch(url)
        const data = await response.json()
        if (data.error !== '0') {
            throw new Error('Ocurrió un error con la api: ', data.error)
        }
        return data
    } catch (error) {
        console.error(error)
        title.textContent = 'Ocurrió un error al intentar obtener la información de la base de datos.'
    }
}

// { 3 }
// Validamos los datos obtenidos de la api según la búsqueda del usuario. En caso de ser correcto renderizamos en el DOM las card creadas para mostrar la información.
const renderBooks = (data, url, totalBooks, search, currentPage) => {
    booksList.innerHTML = ''
    if (url === 'https://api.itbook.store/1.0/new') {
        renderBookCards(data.books)
    } else {
        // Se valida que el array books no esté vacío.
        if (data.books.length === 0) {
            title.textContent = 'No se encontraron coincidencias.'
        } else {
            search = search.replaceAll('-', ' ')
            title.textContent = `Se encontraron ${totalBooks} libros relacionados con "${search}":`
            let totalPages = Math.ceil(totalBooks/10)
            renderBookCards(data.books)

            renderPagination()
            updateCurrentPagesButtons(currentPage, totalPages)
            const lastPageButton = document.getElementById('last-page-button')
            lastPageButton.textContent = totalPages
            activeCurrentPage(currentPage)

            // Lógica para el funcionamiento de los botones, con delegación de eventos.
            const paginationList = document.getElementById('pagination-list')
            paginationList.addEventListener('click', (e) => {
                if (e.target.matches('li')) {
                    setTimeout(() => {
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth' // Transición suave
                        })
                    }, 500)

                    if (e.target.matches('#prev-page-button') && currentPage > 1) {
                        executeSearch(search, currentPage - 1)
                    }
                    if (e.target.matches('#next-page-button') && currentPage < totalPages) {
                        executeSearch(search, currentPage + 1)
                    }
                    if (e.target.matches('#first-page-button') && currentPage !== 1) {
                        executeSearch(search, 1)
                    }
                    if (e.target.matches('#last-page-button') && currentPage !== totalPages) {
                        executeSearch(search, totalPages)
                    }
                    if (e.target.matches('.current-pages-buttons')) {
                        executeSearch(search, parseInt(e.target.textContent))
                    }
                }
            })
        }
    }
}

const renderPagination = () => {
    if (document.getElementById('pagination-list')) {
        document.getElementById('pagination-list').remove()
    }
    const paginationClone = paginationTemplate.content.cloneNode(true)
    container.appendChild(paginationClone)
    
}

const updateCurrentPagesButtons = (currentPage, totalPages) => {
    const buttons = document.getElementsByClassName('current-pages-buttons')
    for (let i = 0; i < buttons.length; i++) {
        if (currentPage === 1 || currentPage === 2) {
            buttons[i].textContent = i + 2
        } else if (currentPage === totalPages) {
            buttons[i].textContent = currentPage - 3 + i
        } else if (currentPage === totalPages - 1) {
            buttons[i].textContent = currentPage - 2 + i
        } else {
            buttons[i].textContent = currentPage - 1 + i
        }
    }
}

// Botón de la paginación activo
const activeCurrentPage = (current) => {
    const paginationButtons = document.getElementsByClassName('pagination-buttons')
    for (let button of paginationButtons) {
        if (button.textContent == current) {
            button.classList.add('pagination-active')
        }
    }
}

// { 4 }
// Función que renderiza las cards con info de los libros recibidos.
const renderBookCards = (books) => {
    const fragment = document.createDocumentFragment()
    books.forEach(book => {
        const bookCard = document.createElement('li')
        bookCard.classList.add('book-card')
        const cardImage = Object.assign(document.createElement('img'), { src: book.image })
        const cardTitle = Object.assign(document.createElement('h3'), { textContent: book.title })
        const cardSubtitle = Object.assign(document.createElement('p'), { textContent: book.subtitle })
        bookCard.append(cardImage, cardTitle, cardSubtitle)
        fragment.appendChild(bookCard)
    })
    booksList.appendChild(fragment)
}

// Listeners Click y Enter para la barra  de búsqueda.
searchButton.addEventListener('click', () => {
    executeSearch(input.value, 1)
})
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        executeSearch(input.value, 1)
    }
})

// { 0 }
// Render al cargar la página por primera vez.
const initialRender = async() => {
    const initialUrl = 'https://api.itbook.store/1.0/new'

    const data = await getBooksData(initialUrl)
    if (data) {
        // Se pasa el cuarto argumento como undefined ya que no se utiliza en este caso.
        renderBooks(data, initialUrl, data.total, undefined)
    }
}
initialRender()