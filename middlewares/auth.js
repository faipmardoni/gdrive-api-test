const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const credentials = path.join(__dirname, '../credentials/credentials.json');

// const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path.join(__dirname, '../credentials/token.json');

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

module.exports = async (req, res, next) => {
  try {
    const content = await readFile(credentials);
    const auth = await authorize(JSON.parse(content));
    req.auth = auth;
    next();
  } catch (error) {
    console.log(error);
    res.status(500);
    res.send({
      status: 500,
      error,
    });
  }
};
