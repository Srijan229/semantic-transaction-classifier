const express = require('express');
const cors = require('cors');
const classificationRoutes = require('./routes/classificationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const etcRoutes = require('./routes/etcRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', classificationRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/etc-codes', etcRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Eton AI Backend is up and running!' });
});

module.exports = app;
