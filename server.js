var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var addItem = require('./lib/add-item')

var index = require('./docs-index.json')
var debug = require('debug')('reserves-bot-server')
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.type('text/plain')
  res.send('^_^ hallo!')
})

app.get('/course/:semester/:id', function (req, res) {
  var id = req.params.id.toUpperCase().replace('-', ' ')
  var item = index.files[id]
  var out = {}

  res.type('application/json')

  if (item) {
    out[id] = item
    res.send(out)
  }
  else res.send({message: 'nothing there!'})
})

app.post('/course/:semester/:courseId', function (req, res) {
  if (req.is('application/json')) {
    var courseId = req.params.courseId.toUpperCase().replace('-', ' ')
    var semesterReg = /(\w+)(\d{4})/
    var semester = req.params.semester.replace(semesterReg, '$1 $2').toLowerCase()
    semester = semester.slice(0,1).toUpperCase() + semester.slice(1)

    debug('got request for `%s: %s`', courseId, semester)

    addItem(courseId, req.body, semester, function (err, resp) {
      if (err) res.send(err)

      return res.send({message: '^_^ okay!'})
    })
  }

})

app.listen(3000)