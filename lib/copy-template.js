var config = require(__dirname + '/../config.json')
var generateDriveClient = require('./generate-drive-client')
var drive = generateDriveClient()
var debug = require('debug')('copyTemplate')

module.exports = function copyTemplateToSemester (courseTitle, semester, cb) {
  var id = config.templateId

  debug('getting semester id')
  return getSemesterId(semester, function (err, sId) {
    if (err) cb(err)

    var params = {
      fileId: id,
      resource: {title: courseTitle}
    }

    debug('copying file:', id)
    return drive.files.copy(params, function (err, res) {
      if (err) cb(err) 

      var copyInfo = res
      var copyId = res.id
      var originalParentId = res.parents[0].id

      var moveParams = {
        fileId: copyId,
        resource: {id: sId}
      }

      debug('adding parent to file')
      drive.parents.insert(moveParams, function (e, r) {
        var removeParams = {
          fileId: copyId,
          parentId: originalParentId
        }

        debug('removing original parent')
        drive.parents.delete(removeParams, function (e, r) {
          return cb && cb(null, copyInfo)
        })
      })
    })
  })
}

function getSemesterId (semester, cb) {
  var query = 'mimeType = "application/vnd.google-apps.folder" and title contains "' + semester + '"'
  drive.files.list({q: query}, function (err, res) {
    if (res.items.length === 1) {
      return cb && cb(err, res.items[0].id)
    }
  })
}