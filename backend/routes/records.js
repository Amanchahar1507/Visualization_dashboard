const express = require('express');
const router = express.Router();
const recordsController = require('../controllers/recordsController');


router.get('/', recordsController.getRecords);
router.get('/filters', recordsController.getFilters);
router.get('/summary', recordsController.getSummary);

module.exports = router;
