const express = require('express');
const router = express.Router();
const etcController = require('../controllers/etcController');

router.get('/', etcController.getAll);

module.exports = router;
