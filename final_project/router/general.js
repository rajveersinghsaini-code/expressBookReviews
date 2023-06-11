const express = require('express');
const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;
const public_users = express.Router();

// Verify if user already exist in users array
const doesUserExist = (username) => {
  return users?.some(
    (user) => user.username?.toLowerCase() === username?.toLowerCase()
  );
};

// Register user by username and password
public_users.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesUserExist(username)) {
      users.push({ username, password });
      return res.status(201).json({ message: 'User added successfully.' });
    } else {
      return res.status(200).json({ message: 'Username already exists.' });
    }
  } else {
    return res.status(400).json({ message: 'Unable to register user.' });
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const bookPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 500);
  });

  bookPromise.then((result) => {
    return res.status(200).json({ books: result });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const isbnPromise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(books[isbn]), 600);
  });

  const isbnBook = await isbnPromise;

  if (isbnBook) {
    return res.status(200).json({ books: isbnBook });
  } else {
    return res.status(204).json({ message: 'Book not found' });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const authorName = req.params.author;

  const bookPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filteredBooks = Object.values(books).filter(
        (book) => book.author?.toLowerCase() === authorName?.toLowerCase()
      );
      resolve(filteredBooks);
    }, 600);
  });

  const filteredBooks = await bookPromise;

  if (filteredBooks) {
    return res.status(200).json({ books: filteredBooks });
  } else {
    return res
      .status(204)
      .json({ message: 'Book not found for selected author' });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const bookTitle = req.params.title;

  const bookPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filteredBooks = Object.values(books).filter(
        (book) => book.title?.toLowerCase() === bookTitle?.toLowerCase()
      );
      resolve(filteredBooks);
    }, 600);
  });

  const filteredBooks = await bookPromise;
  if (filteredBooks) {
    return res.status(200).json({ books: filteredBooks });
  } else {
    return res.status(204).json({ message: 'Book not found' });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const bookReviews = books[isbn].reviews;
  if (bookReviews) {
    return res.status(200).json({ reviews: bookReviews });
  } else {
    return res.status(404).json({ message: 'No reviews found' });
  }
});

module.exports.general = public_users;
