import api from './electronAPI'

const bookService = {

    // FETCH BOOKS
    fetchBooks: async () => {
        return await api.getBooks();
    },

    //ADD BOOK
    addBook: async (book) => {
        return await api.createBook(book);
    },

    //UPDATE BOOK
    updateBook: async (id, book) => {
        return await api.updateBook(id, book)
    },

    //DELETE BOOK
    deleteBook: async (id) => {
        return await api.deleteBook(id);
    },

    //GET COMPLETED BOOKS
    getCompletedBooks: (books) => {
        return books.filter(b => b.status === "completed");
    },

    //GET BOOK BY ID
    getBookById: (books, id) => {
        return books.find(b => b.id === id);
    }

}

export default bookService;