require('dotenv').config()

const morgan = require('morgan');
const express = require('express');
const path = require('path');
//const mongoose = require('mongoose');
var cors = require('cors')


const connectDB = require('./src/database');

const app = express();
app
.use(cors())
.use(express.json())
.use(express.urlencoded({ extended: true }))
// .use(morgan('dev'))
.use('/files/profile',express.static('tmp/profile'))
.use('/files/message',express.static('tmp/message'))
connectDB();

app.use('/api', require('./src/routes'));


const socketIo = require('./src/app/utils/websocket')

socketIo(app)

/*
tmp/message/*

!tmp/message/.gitkeep

tmp/profile/*

!tmp/profile/.gitkeep
*/



