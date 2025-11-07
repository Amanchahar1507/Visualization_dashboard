
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const recordsRouter = require('./routes/records');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
console.log('MONGO_URI', MONGO_URI);
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('Mongo connected'))
  .catch(err=>console.error(err));

const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(",") || [];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use('/api/records', recordsRouter);

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log('Listening on', port));
