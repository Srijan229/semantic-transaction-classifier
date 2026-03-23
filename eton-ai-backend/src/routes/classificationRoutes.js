const express = require('express');
const router = express.Router();
const classificationController = require('../controllers/classificationController');

router.post('/classify-transaction', classificationController.classify);
router.post('/classify-batch', classificationController.classifyBatch);

module.exports = router;
