require('dotenv').config();
const mongoose = require('mongoose');
const Record = require('./models/Record');
const data = require('./jsondata.json'); 

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    await Record.deleteMany({});
    console.log('Cleared existing records');

    const prepared = data.map(item => {
      const copy = { ...item };
      if (copy.end_year === '') copy.end_year = null;
      if (copy.start_year === '') copy.start_year = null;
      return copy;
    });

    await Record.insertMany(prepared);
    console.log('Inserted', prepared.length, 'records');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
