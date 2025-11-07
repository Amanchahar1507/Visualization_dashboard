
const express = require('express');
const mongoose = require('mongoose');
const recordsRouter = require('./routes/records');
const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('Mongo connected'))
  .catch(err=>console.error(err));

app.use('/api/records', recordsRouter);

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log('Listening on', port));
