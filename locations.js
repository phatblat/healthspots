// requires
var ibmbluemix = require('ibmbluemix')
var express = require('express')
var http = require('http')
var https = require('https')
var path = require('path')

// logger
var log = ibmbluemix.getLogger()

// express
var app = express()
app.set('port', process.env.PORT || 3000)
app.use(express.static(path.join(__dirname, 'public')))

// start server
http.createServer(app).listen(app.get('port'), function() {
  log.info('Express server listening on port ' + app.get('port'))
})
