const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path.join(__dirname, '../credentials/token.json');
const credentials = path.join(__dirname, '../credentials/credentials.json');
const IMG_PATH = path.join(__dirname, './2b047efd.jpg');

async function authorize(params) {
  try {
    const { client_secret, client_id, redirect_uris } = params.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0],
    );
    const token = await readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (error) {
    console.log('error auth');
  }
}

async function listFiles(auth) {
  try {
    const drive = google.drive({ version: 'v3', auth });
    const { data: { files } } = await drive.files.list({
      pageSize: 100,
      fields: 'nextPageToken, files(id, name)',
    });
    return files;
  } catch (error) {
    console.log('error show list');
  }
}

// async function upload(auth) {
//   const drive = google.drive({ version: 'v3', auth });
//   const { data } = await drive.files.create({
//     requestBody: {
//       name: 'test2.png',
//       mimeType: 'image/png',
//       copyRequiresWriterPermission: true,
//     },
//     media: {
//       mimeType: 'image/png',
//       body: fs.createReadStream(IMG_PATH),
//     },
//   });
//   const temp = await drive.permissions.create({
//     fileId: data.id,
//     resource: {
//       role: 'reader',
//       type: 'user',
//       emailAddress: 'doni@volantis.io',
//     },
//     fields: 'id',
//   });
//   console.log(temp);
//   return data;
// }

module.exports = {
  async getList(req, res) {
    try {
      const content = await readFile(credentials);
      const auth = await authorize(JSON.parse(content));
      if (!auth) {
        const params = JSON.parse(content);
        const { client_secret, client_id, redirect_uris } = params.installed;
        const oAuth2Client = new google.auth.OAuth2(
          client_id, client_secret, redirect_uris[0],
        );
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
          rl.close();
          oAuth2Client.getToken(code, async (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (error) => {
              if (error) console.error(error);
              console.log('Token stored to', TOKEN_PATH);
            });
            const files = await listFiles(oAuth2Client);
            res.status(200).json({
              message: 'success',
              files,
            });
          });
        });
      } else {
        const files = await listFiles(auth);
        // const newFile = await upload(auth);
        res.status(200).json({
          message: 'success',
          files,
          // newFile,
        });
      }
    } catch (error) {
      console.log('error getList');
      console.log(error);
    }
  },
};
