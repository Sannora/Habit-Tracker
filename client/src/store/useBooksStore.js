import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import bookService from '../services/bookService';

const useBooksStore = create(
  immer((set, get) => ({

    books: [],
    loading: false,
    error: null,

    fetchBooks: async () => {

      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {

        const books = await bookService.fetchBooks();

        set((state) => {
          state.books = books;
          state.loading = false;
        });

      } catch (error) {

        set((state) => {
          state.error = error;
          state.loading = false;
        });

      }
    },

    addBook: async (bookData) => {

      try {

        const newBook =
          await bookService.addBook(bookData);

        set((state) => {
          state.books.push(newBook);
        });

      } catch (error) {

        set((state) => {
          state.error = error;
        });

      }
    },

    updateBook: async (id, updatedBook) => {

      try {

        const updated =
          await bookService.updateBook(
            id,
            updatedBook
          );

        set((state) => {

          const index =
            state.books.findIndex(
              (b) => b.id === id
            );

          if (index !== -1) {
            state.books[index] = updated;
          }

        });

      } catch (error) {

        set((state) => {
          state.error = error;
        });

      }
    },

    deleteBook: async (id) => {

      try {

        await bookService.deleteBook(id);

        set((state) => {
          state.books =
            state.books.filter(
              (b) => b.id !== id
            );
        });

      } catch (error) {

        set((state) => {
          state.error = error;
        });

      }
    }

  }))
);

export default useBooksStore;