// requires
var ibmbluemix = require('ibmbluemix')
var express = require('express')
var http = require('http')
var https = require('https')
var path = require('path')

// custom module
var kp = require('./kp.js')

// logger
var log = ibmbluemix.getLogger()
function logDelimit() {
  log.info('-------------------------------------------------------')
}

// initialization
var KP_KEY = process.env.KP_KEY;

function initialize() {
  if (process.env.VCAP_SERVICES) {
    var vcapServices = JSON.parse(process.env.VCAP_SERVICES)
  }
  else {
    log.warn('VCAP_SERVICES environment variable is not set')
  }
}
initialize()

var TWITTER_CREDENTIALS = {
  "username": "91271250-1e02-4c8e-b197-c8ed5137ff58",
  "password": "TCIUqoUQ6H",
  "host": "cdeservice.mybluemix.net",
  "port": 443,
  "url": "https://91271250-1e02-4c8e-b197-c8ed5137ff58:TCIUqoUQ6H@cdeservice.mybluemix.net"
}

// KP facility data
var sample = {
    "facilities": [{
        "lat": 34.043324,
        "lng": -118.37654,
        "name": "Vision Essentials by Kaiser Permanente, La Cienega",
        "type": "Other",
        "positive": 2,
        "negative": 0
    }]
}

// express
var app = express()
app.set('port', process.env.PORT || 3000)
app.use(express.static(path.join(__dirname, 'public')))

// set up paths
app.get('/', function (request, response) {
    response.sendfile('index.html');
})

app.get('/facilities', function (request, response) {
  var zipcode = request.query.zipcode

  logDelimit()
  log.info('Request to find facilities for: ' + zipcode)

  response.setHeader('Content-Type', 'application/json')

  kp.getKPLocations(zipcode, KP_KEY, function (locationData) {
    response.end(JSON.stringify({
      facilities: locationData
    }))
    logDelimit()
  })
})

// start server
http.createServer(app).listen(app.get('port'), function() {
  log.info('Express server listening on port ' + app.get('port'))
})
