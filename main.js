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
    
    const url = getFormattedSearch(formattedSearch, page)
    const data = await getBooksData(url)
    if (data) {
        renderBooks(data, url, data.total, formattedSearch, page)
    }
    // Despejamos la barra de búsqueda.
    input.value = ''
    window.scrollTo(0, 0)
    console.log('Current url:', url)
}

const getFormattedSearch = (search, page) => {
    return `https://api.itbook.store/1.0/search/${search}/${page}`
}

// Listeners Click y Enter para labarra  de búsqueda.
searchButton.addEventListener('click', () => {
    title.textContent = 'Cargando...'
    executeSearch(input.value, 1)
})
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        title.textContent = 'Cargando...'
        executeSearch(input.value, 1)
    }
})

// { 2 }
// Realizamos el fetch de la api con nuestra url dinámica.
const getBooksData = async(url) => {
    try {
        const response = await fetch(url)
        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
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
            const lastPageButton = document.getElementById('last-page-button')
            lastPageButton.textContent = totalPages

            // Lógica para el funcionamiento de los botones, con delegación de eventos.
            const paginationList = document.getElementById('pagination-list')
            paginationList.addEventListener('click', (e) => {
                if (e.target.matches('#prev-page-button')) {
                    if (currentPage > 1) {
                        executeSearch(search, currentPage - 1)
                    }
                }
                if (e.target.matches('#next-page-button')) {
                    if (currentPage < totalPages) {
                        executeSearch(search, currentPage + 1)
                    }
                }
                if (e.target.matches('#first-page-button')) {
                    if (currentPage !== 1) {
                        executeSearch(search, 1)
                    }
                }
                if (e.target.matches('#last-page-button')) {
                    if (currentPage !== totalPages) {
                        executeSearch(search, totalPages)
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
