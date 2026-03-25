const express = require('express');
const cors = require('cors');
const classificationRoutes = require('./routes/classificationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const transactionCategoryRoutes = require('./routes/transactionCategoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/tcc', classificationRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/transaction-category-codes', transactionCategoryRoutes);
app.use('/api/v1/uploads', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Semantic Transaction Classifier API is running.' });
});

module.exports = app;
