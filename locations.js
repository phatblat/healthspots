// requires
var ibmbluemix = require('ibmbluemix')
var express = require('express')
var http = require('http')
var https = require('https')
var path = require('path')

// custom module
var kp = require('./kp.js')
var sentiment = require('./sentiment')

// logger
var log = ibmbluemix.getLogger()
function logDelimit() {
  log.info('-------------------------------------------------------')
}

// initialization
var KP_KEY = process.env.KP_KEY

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
    response.sendfile('index.html')
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

app.get('/facilitiesAndSentiments', function (request, response) {
    var zipcode = request.query.zipcode

    log.info('Finding facilities and sentiments for: ' + zipcode)

    response.setHeader('Content-Type', 'application/json')

    kp.getKPLocations(zipcode, KP_KEY, function (locationData) {
        var numberOfLocations = locationData.length - 1

        log.info('number of locations: ' + locationData.length)

        var negativeResponseCount = 0
        var positiveResponseCount = 0

        locationData.forEach(function (item) {

            response.setHeader('Content-Type', 'application/json')

            sentiment.sendSentimentRequest(item.name, 'positive', TWITTER_CREDENTIALS, function (parsedData) {

                if (parsedData !== 'error') {

                    var positiveResponse = JSON.parse(parsedData)

                    locationData[positiveResponseCount].positive = positiveResponse.search.results

                    positiveResponseCount++

                    sentiment.sendSentimentRequest(item.name, 'negative', TWITTER_CREDENTIALS, function (negData) {
                        var negativeResponse = JSON.parse(negData)

                        locationData[negativeResponseCount].negative = negativeResponse.search.results

                        negativeResponseCount++

                        if (negativeResponseCount === numberOfLocations) {
                            response.end(JSON.stringify({
                                facilities: locationData
                            }))

                            log.info('Data for ' + numberOfLocations + ' from ' + locationData.length + ' possible locations ')
                        }
                    })

                } else {
                    numberOfLocations = numberOfLocations - 1
                }
            })
        })
    })
})

// start server
http.createServer(app).listen(app.get('port'), function() {
  log.info('Express server listening on port ' + app.get('port'))
})
