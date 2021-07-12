const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const { host, port, user, password } = require('../config/mail.js');

const transport = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: { user, pass: password },
  tls: {
    rejectUnauthorized: false,
  }
})

const handlebarOptions = {
  viewEngine: {
    extName: '.html',
    partialsDir: path.resolve('./src/resources/mail/'),
    layoutsDir: path.resolve('./src/resources/mail/'),
    defaultLayout: '',
  },
  viewPath: path.resolve('./src/resources/mail/'),
  extName: '.html',
}

transport.use('compile', hbs(handlebarOptions));

module.exports = transport;