const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/summary', transactionController.getSummary);
router.get('/', transactionController.getAll);
router.get('/:id', transactionController.getOne);
router.put('/:id/override', transactionController.override);

module.exports = router;
