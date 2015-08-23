// adds an item to the course spreadsheet

var Spreadsheet = require('google-spreadsheet')
var config = require(__dirname + '/../config.json')
var auth = config.google
var createSpreadsheet = require('./copy-template')
var debug = require('debug')('add-item')

module.exports = function addItemToCourse (course, item, semester, cb) {
  course = course.toUpperCase()

  // grab a fresh copy w/ every call
  var index = require(__dirname + '/../docs-index.json')
  var info = index.files[course]

  // handle this better by adding the course
  if (!info) {
    debug('no course found [%s], copying it', course)
    createSpreadsheet(course, semester, function (err, info) {
      debug('course created, adding to index')
      addSheetToIndex(course, {
        id: info.id,
        title: info.title,
        lastModified: info.lastModified,
        link: info.alternateLink
      })

      debug('course created, adding item')
      return addItem(new Spreadsheet(info.id), item, cb)
    })
  } else {
    debug('course found, adding item')
    return addItem(new Spreadsheet(info.id), item, cb)
  }

  function addItem (sheet, item, callback) {
    if (!item.url && item.oclcnumber) {
      item.url = config.wmsBaseUrl + '/oclc/' + item.oclcnumber
    }
    return sheet.useServiceAccountAuth(auth, function (err) {
      if (err) return callback(err)

      debug('checking for duplicate barcodes')
      sheet.getInfo(function (err, info) {
        if (err) return callback(err)

        var ws = info.worksheets[0]
        ws.getRows(function (e, rows) {
          var i = 0
          var len = rows.length

          for (; i < len; i++) {
            var row = rows[i]
            if (row.barcode == item.barcode) {
              debug('found duplicate item, updating info')
              var k
              for (k in item) {
                row[k] = item[k]
              }
              row.save()
              return callback && callback()
            }
          }

          sheet.addRow(1, item, function (err) {
            if (err) return callback(err)

            return callback && callback()
          })
        })
      })
    })
  }

  function addSheetToIndex (title, info) {
    var fs = require('fs')
    var indexPath = __dirname + '/../docs-index.json'
    var data = JSON.parse(fs.readFileSync(indexPath))
    data['files'][title] = info

    return fs.writeFileSync(indexPath, JSON.stringify(data))
  }
}
