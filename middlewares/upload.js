const { google } = require('googleapis');
const stream = require('stream');

module.exports = async (req, res, next) => {
  const { auth } = req;
  const fileObject = req.file;
  if (fileObject) {
    try {
      const drive = google.drive({
        version: 'v3',
        auth,
      });
      const { originalname: filename, buffer, mimetype: mimeType } = fileObject;
      const body = new stream.PassThrough();
      body.end(buffer);
      const { data } = await drive.files.create({
        requestBody: {
          name: filename,
          mimeType,
          copyRequiresWriterPermission: true,
        },
        media: {
          mimeType,
          body,
        },
      });
      req.files = data;
      next();
    } catch (error) {
      res.status(500);
      res.send({
        status: 500,
        error,
      });
    }
  } else {
    req.files = {};
    next();
  }
};
