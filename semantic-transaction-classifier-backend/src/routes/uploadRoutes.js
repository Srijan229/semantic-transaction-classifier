const express = require('express');
const multer = require('multer');
const classificationController = require('../controllers/classificationController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/transactions', upload.single('file'), classificationController.uploadCsv);

module.exports = router;
