const express = require('express');
const cors = require('cors');
const classificationRoutes = require('./routes/classificationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const transactionCategoryRoutes = require('./routes/transactionCategoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());

app.use('/api/v1/tcc', classificationRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/transaction-category-codes', transactionCategoryRoutes);
app.use('/api/v1/uploads', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Semantic Transaction Classifier API is running.' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
