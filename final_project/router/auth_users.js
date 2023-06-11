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
    return res
      .status(200)
      .json({ loggedIn: true, message: 'User successfully logged in!' });
  } else {
    return res.status(200).json({ message: 'Invalid username or password' });
  }
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization['username'];
  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res
      .status(200)
      .json({ message: 'review succeed', reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: 'Book not found' });
  }
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res
      .status(200)
      .json({ message: 'review deleted', reviews: books[isbn].reviews });
  }
  return res.status(404).json({ message: 'Book not found' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
