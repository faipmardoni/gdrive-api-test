const express = require('express');
const multer = require('multer');

const router = express.Router();
const uploaderMem = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const { getList } = require('../controllers/home.controller');

/* GET home page. */
router.get('/', getList);

module.exports = router;
