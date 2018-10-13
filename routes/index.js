const express = require('express');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const { getList } = require('../controllers/home.controller');
const { auth, uploader } = require('../middlewares');

/* GET home page. */
router.get('/', getList);
router.post(
  '/',
  upload.single('video'),
  auth,
  uploader,
  (req, res) => {
    res.status(200).json({
      message: 'success',
      data: req.files,
    });
  },
);

module.exports = router;
