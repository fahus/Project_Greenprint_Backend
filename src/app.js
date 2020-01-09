var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const { google_key, carbon_key } = require('../config')
var googleMaps = require('@google/maps').createClient({
  key: google_key
});

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Production routes
app.post('/', (req, res) => {
  const googleMapsQuery = {
    origin: req.body.from,
    destination: req.body.to,
    units: 'imperial',
    mode: 'transit'
  }

  googleMaps.directions(googleMapsQuery, function(err, response) {
    if (!err) {
      const carbonQuery = {
        distance: response.json.routes[0].legs[0].distance.text,
        duration: response.json.routes[0].legs[0].duration.text,
        mode: response.json.routes[0].legs[0].steps[0].travel_mode,
        carbonFootprint: ""
      }
      res.json(carbonQuery);
    } else {
      console.log(err);
    }
  });
})

app.get('/', (req, res) => {
  res.status(200).json({
    "thing": "somethingElse"
  })
})

// Test routes
app.post('/test-route', (req, res) => {
  res.status(200).json({ results: [
    {
      mode: "walking",
      travel_time: "3 hours",
      distance: 8,
      carbon: 0
    },
    {
      mode: "cycling",
      travel_time: "1 hour",
      distance: 8,
      carbon: 0
    },
    {
      mode: "car",
      travel_time: "20 minutes",
      distance: 10,
      carbon: 2.30
    },
    {
      mode: "public transport",
      travel_time: "10 minutes",
      distance: 2,
      carbon: 0.5
    }
  ]})
});

module.exports = app;
