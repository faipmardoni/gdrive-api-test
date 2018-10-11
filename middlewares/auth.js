const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const credentials = path.join(__dirname, '../credentials/credentials.json');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path.join(__dirname, '../credentials/token.json');

module.exports = {
  async auth(req, res, next) {
    const content = await readFile(credentials);
  }
}