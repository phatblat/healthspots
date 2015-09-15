// requires
var ibmbluemix = require('ibmbluemix')
var express = require('express')
var http = require('http')
var https = require('https')
var path = require('path')

// logger
var log = ibmbluemix.getLogger()
function logDelimit() {
  log.info('-------------------------------------------------------')
}

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

initialize()

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
    log.info('Beginning finding facilities for: ' + zipcode)

    var snapshotData = []

    var options = {
      hostname: 'api.kp.org',
      path: '/v1/locator/facility?zip=' + zipcode,
      method: 'GET',
      headers: {
        'consumer-key': 'T3GUyGKiw1FrPaSfSe31BBFhXMAKWfXT'
      }
    }

    var req = https.request(options, function (res) {
      var body = ''

      res.on('data', function (d) {
        body = body + d
      })

      res.on('end', function () {
        var payload = JSON.parse(body)
        var snapshotData = []
        var facilities = payload.KPFacilities

        if (facilities) {
          facilities.forEach(function (facility) {
            var snapshot = {
                "lat": facility.loc[1],
                "lng": facility.loc[0],
                "name": facility.official_name,
                "type": facility.facility_type,
                "positive": 0,
                "negative": 0
            }
            snapshotData.push(snapshot)
          })
        }

        log.info('Wrapping up finding facilities for: ' + zipcode)

        callback(snapshotData)
      })
    })

    req.end()

    req.on('error', function (e) {
        log.error(e)
    })
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

  getKPLocations(zipcode, function (locationData) {
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
