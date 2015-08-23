module.exports = function generateDriveClient () {
  var config = require(__dirname + '/../config.json')
  var auth = config.google
  var google = require('googleapis')
  var scope = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
  var jwtClient = new google.auth.JWT(auth.client_email, null, auth.private_key, scope, null)
  var drive = google.drive({version:'v2', auth: jwtClient})

  return drive
}