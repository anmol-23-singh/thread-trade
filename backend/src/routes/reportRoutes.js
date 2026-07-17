const express = require('express');
const { protect } = require('../middleware/auth');
const { createReport } = require('../controllers/reportController');

const router = express.Router();

router.post('/', protect, createReport);

module.exports = router;
