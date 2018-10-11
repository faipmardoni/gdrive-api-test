// const multer = require('multer')
// const Storage = require('@google-cloud/storage')
// require('dotenv').config();

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${BUCKET_CONFIG.name}/${filename}`;
}

// const BUCKET_CONFIG = {
//   name: process.env.CLOUD_BUCKET
// }

module.exports = {
  upload(req, res, next) {
    if (!req.file) {
      req.imageURL = 'https://www.arabamerica.com/wp-content/themes/arabamerica/assets/img/thumbnail-default.jpg'
      return next()
    } else {
      const storage = Storage({
        projectId: process.env.GCLOUD_PROJECT,
        keyFilename: process.env.KEYFILE_PATH
      })
      const bucket = storage.bucket(BUCKET_CONFIG.name)
      const filename = Date.now() + '.' + req.file.originalname.split('.').pop()
      const file = bucket.file(filename)
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype
        }
      })
  
      stream.on('error', (err) => {
        console.log('error uploading to GCS', err)
        next(err)
      })
  
      stream.on('finish', () => {
        file.makePublic()
          .then(() => {
            req.imageURL = getPublicUrl(filename)
            next()
          })
      })
      stream.end(req.file.buffer)
    }
  }
}