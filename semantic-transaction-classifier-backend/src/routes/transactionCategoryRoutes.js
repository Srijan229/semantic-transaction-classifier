const express = require('express');
const router = express.Router();
const transactionCategoryController = require('../controllers/transactionCategoryController');

router.get('/', transactionCategoryController.getAll);

module.exports = router;
