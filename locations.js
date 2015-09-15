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

function getKPLocations(zipcode, callback) {
    callback(sample)
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

  log.info('Request to find facilities for: ' + zipcode)

  response.setHeader('Content-Type', 'application/json')

  getKPLocations(zipcode, function (locationData) {
    response.end(JSON.stringify({
      facilities: locationData
    }))
  })
})

// start server
http.createServer(app).listen(app.get('port'), function() {
  log.info('Express server listening on port ' + app.get('port'))
})
