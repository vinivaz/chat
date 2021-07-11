require('dotenv').config()

const express = require('express');
//const mongoose = require('mongoose');

const connectDB = require('./src/database');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api', require('./src/routes'));



app.listen(process.env.SERVER_PORT||3000);