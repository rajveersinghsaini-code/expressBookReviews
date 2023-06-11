const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const APP_SECRETS = require('./utils/constants.js').APP_SECRETS;

const PORT = 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/customer',
  session({
    secret: APP_SECRETS.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use('/customer/auth/*', function auth(req, res, next) {
  if (req.session.authorization) {
    const accessToken = req.session.authorization['accessToken'];
    jwt.verify(accessToken, APP_SECRETS.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: 'User not authenticated' });
      }
    });
  } else {
    return res.status(403).json({ message: 'User not logged in!' });
  }
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

app.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
);
