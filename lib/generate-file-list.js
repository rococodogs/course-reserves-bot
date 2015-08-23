var generateDriveClient = require('./generate-drive-client.js')

module.exports = function generateFileList (semester, cb) {
  var drive = generateDriveClient()
  var query = 'mimeType = "application/vnd.google-apps.folder" and title contains "' + semester + '"'

  return drive.files.list({q: query}, function (err, list) {
    if (err) return cb(err)
    
    if (list.items.length === 1) {
      var folder = list.items[0]
      var id = folder.id
      var newQuery = '"' + id + '" in parents'

      return drive.files.list({q: newQuery}, function (err, list) {
        if (err) return cb(err)
        else return cb(null, list.items, list)
      })
    }
  })
}