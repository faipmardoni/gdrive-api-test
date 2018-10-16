const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const credentials = path.join(__dirname, '../credentials/credentials.json');
const TOKEN_PATH = path.join(__dirname, '../credentials/token.json');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

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
    if (auth) {
      req.auth = auth;
      next();
    }
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
        req.auth = oAuth2Client;
        next();
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.send({
      status: 500,
      error,
    });
  }
};
