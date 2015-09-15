// requires
var ibmbluemix = require('ibmbluemix')
var express = require('express')
var http = require('http')
var https = require('https')
var path = require('path')

// logger
var log = ibmbluemix.getLogger()

// initialization
function initialize() {
  if (process.env.VCAP_SERVICES) {
    var vcapServices = JSON.parse(process.env.VCAP_SERVICES)
    log.info(process.env.VCAP_SERVICES)
  }
  else {
    log.warn('VCAP_SERVICES environment variable is not set')
  }
}

// express
var app = express()
app.set('port', process.env.PORT || 3000)
app.use(express.static(path.join(__dirname, 'public')))

// set up paths
app.get('/', function (request, response) {
    response.sendfile('index.html');
})

// start server
http.createServer(app).listen(app.get('port'), function() {
  log.info('Express server listening on port ' + app.get('port'))
})
