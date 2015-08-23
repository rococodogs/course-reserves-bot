var generateFileList = require('./lib/generate-file-list')
var semester = (process.argv[2] || 'fall 2015').replace(/[-_]/, ' ')
var fs = require('fs')
var path = require('path')
var jsonPath = path.join(__dirname, 'docs-index.json')
var courseReg = /[A-Z]{3}[\s\-]?\d{3,}/g

generateFileList(semester, function (err, items, fullResp) {
  var out = {
    timestamp: (new Date()).toISOString(),
    semester: semester,
    files: {}
  }

  items.forEach(function (item) {
    var title = item.title
    var id = item.id
    var match = title.match(courseReg)
  
    if (!match) return

    var courseId = match[0]

    var info = {
      id: id,
      title: title,
      lastModified: item.modifiedDate,
      link: item.alternateLink
    }

    if (out.files[courseId]) {
      // figure how to deal with duplicates, this array strategy's probably not good
      out.files[courseId] = [out.files[courseId], info]
    } else {
      out.files[courseId] = info
    }
  })

  return fs.writeFileSync(jsonPath, JSON.stringify(out))
})