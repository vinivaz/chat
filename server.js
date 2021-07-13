require('dotenv').config()

const morgan = require('morgan');
const express = require('express');
const path = require('path');
//const mongoose = require('mongoose');

const connectDB = require('./src/database');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/files/profile',express.static('tmp/profile'));
connectDB();

app.use('/api', require('./src/routes'));



app.listen(process.env.SERVER_PORT||3000);