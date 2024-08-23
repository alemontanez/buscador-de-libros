const container = document.getElementById('container')
const booksList = document.getElementById('books-list')
const searchButton = document.getElementById('search')
const input = document.getElementById('input')
const title = document.getElementById('title')
let search = ''

// Función que valida el valor de la búsqueda, en caso de no ser un string vacío ejecuta la búsqueda.
const executeSearch = () => {
    search = input.value
    // Se formatea los espacios del string de búsqueda para no tener errores al insertarlo en la url mas adelante.
    const formattedSearch = search.replaceAll(' ', '')
    const queryUrl = `https://api.itbook.store/1.0/search/${formattedSearch}`
    // Validamos que la búsqueda no sea vacía para evitar ese render innecesario.
    if (formattedSearch === '') {
        return
    } else {
        fetchBooks(queryUrl)
        input.value = ''
    }
}

// Listeners Click y Enter para la barra de búsqueda.
searchButton.addEventListener('click', () => {
    executeSearch()
})
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        executeSearch()
    }
})

// Función asíncrona donde realizamos el fetch de la api con nuestra url dinámica.
const fetchBooks = async(url) => {
    try {
        const response = await fetch(url)
        const data = await response.json()
        // Almacenamos en books el array books obtenido de data.
        const books = data.books
        renderBooks(books, url)
    } catch (error) {
        console.error(error)
    }
}

// Función donde validamos los datos obtenidos de la api según la búsqueda del usuario. En caso de ser correcto renderizamos en el DOM las card creadas para mostrar la información.
const renderBooks = (books, url) => {
    booksList.innerHTML = ''
    const fragment = document.createDocumentFragment()
    // Validamos que el array books no esté vacío. E ncaso de estar vacío renderizamos el mensaje en el cual indicamos que no se encontraron libros que coincidan con la búsqueda.
    if (books.length === 0) {
        title.textContent = 'No se encontraron coincidencias'
        booksList.appendChild(p)
    } else {
        // Corroboramos que la url no sea la del render inicial, para indicar si cambiamos o no el título.
        if (url !== 'https://api.itbook.store/1.0/new') {
            title.textContent = `Libros relacionados con "${search}"`
        }
        // Recorremos el array books y creamos la card correspondiente para cada item, para luego pasarlo en nuestro fragment. Una vez finalizado el bucle renderizamos la lista con todas las card en el dom.
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
}

// Render al cargar la página por primera vez
const initialRender = () => {
    const initialUrl = 'https://api.itbook.store/1.0/new'
    fetchBooks(initialUrl)
}
initialRender()
