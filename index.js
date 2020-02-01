import dotenv from 'dotenv';
dotenv.config();

import {Server} from 'http';
import express from 'express';
import path from 'path';
const app = express();

const server = new  Server(app)

// static files
app.use('/client', express.static(path.join(__dirname,'public')));

app.get('/', (req,res) => {
  res.sendFile(__dirname + '/client/index.html');
})

server.listen(process.env.PORT || 3001);
