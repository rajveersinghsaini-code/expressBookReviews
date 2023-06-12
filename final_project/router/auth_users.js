const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const APP_SECRETS = require('./../utils/constants.js').APP_SECRETS;
const regd_users = express.Router();

const users = [];

const isValid = (username) => {
  return users?.some(
    (user) => user?.username?.toLowerCase() === username?.toLowerCase()
  );
};

const authenticatedUser = (username, password) => {
  return users?.some(
    (user) =>
      user?.username?.toLowerCase() === username?.toLowerCase() &&
      user?.password === password
  );
};

//only registered users can login
regd_users.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: 'Error logging in' });
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign(
      { username: username, role: 'user' },
      APP_SECRETS.JWT_SECRET,
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = { accessToken, username };
    return res.status(200).send('Customer successfully logged in');
  } else {
    return res.status(200).send('Invalid username or password');
  }
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  if (books[isbn]) {
    if (review) {
      const username = req.session.authorization['username'];
      books[isbn].reviews[username] = review;
      return res
        .status(200)
        .send(
          `The review for the book with ISBN ${isbn} has been added/updated.`
        );
    } else {
      return res.status(404).send('Invalid input');
    }
  } else {
    return res.status(404).send('Book not found');
  }
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res
      .status(200)
      .send(
        `Reviews for the book with ISBN ${isbn} posted by user ${username} deleted.`
      );
  }
  return res.status(404).json({ message: 'Book not found' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
