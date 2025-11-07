require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const recordsRouter = require('./routes/records');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo connection error', err));

app.use('/api/records', recordsRouter);

app.get('/', (req, res) => res.send('MERN DataViz Backend is running'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
