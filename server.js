'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

require('dotenv').config();

const PORT = process.env.PORT;

const app = express();

app.use(cors());

app.get('/location', (request,response) => {
  getLocation(request.query.data)
    .then( locationData => response.send(locationData) )
    .catch( error => handleError(error, response) );
});

app.get('/weather', getWeather);

function handleError(err, res) {
  console.error('ERR', err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

app.listen(PORT, () => console.log(`App is up on ${PORT}`) );

function getLocation(query) {

  const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(_URL)
    .then( data => {
      if ( ! data.body.results.length ) { throw 'No Data'; }
      else {
        let location = new Location(data.body.results[0]);
        location.search_query = query;
        return location;
      }
    });
}

function Location(data) { 
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}


function getWeather(request, response) {

  const _URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  return superagent.get(_URL)
    .then(result => {

      const weatherSummaries = [];

      result.body.daily.data.forEach(day => {
        const summary = new Weather(day);
        weatherSummaries.push(summary);
      });

      response.send(weatherSummaries);

    })
    .catch(error => handleError(error, response));
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}


//////////// yelp///////

app.get('/yelp', (request, response) => {
    searchYelp(request.query.data)//this is the formatted location objecy
      .then( yelpData => {
        response.send(yelpData);
      })
  })
  
  function searchYelp(location){
    const URL = `https://api.yelp.com/v3/businesses/search?latitude=${location.latitude}&longitude=${location.longitude}`;
  
    return superagent.get(URL)
      .set( 'Authorization', `Bearer ${process.env.YELP_API_KEY}`)
      .then( data => {
        let yelpData = data.body.businesses.map( item => {
          return new Business(item);
        })
        console.log(yelpData);
        return yelpData;
      })
  }
  
  function Business(business) {
    this.name = business.name;
    this.image_url = business.image_url;
    this.price = business.price;
    this.rating = business.rating;
    this.url = business.url;
  }
  
  //////////errors
  function handleError(error,response) {
    console.log('error',error);
    if(response){
      response.status(500).send('sorry there is no data')
    }
  }

  //////////// movie////////
//   app.get('/movie', (request, response) => {
//     searchmovie(request.query.data)//this is the formatted movie objecy
//       .then( movieData => {
//         response.send(movieData);
//       })
//   })
  
//   function searchmovie(location){
//     const URL = `https://api.yelp.com/v3/businesses/search?latitude=${location.latitude}&longitude=${location.longitude}`;
  
//     return superagent.get(URL)
//       .set( 'Authorization', `Bearer ${process.env.MOVIE_API_KEY}`)
//       .then( data => {
//         let movieData = data.body.businesses.map( item => {
//           return new Movies(item);
//         })
//         console.log(yelpData);
//         return yelpData;
//       })
//   }
  
//   function Movies(business) {
//     this.name = business.name;
//     this.image_url = business.image_url;
//     this.price = business.price;
//     this.rating = business.rating;
//     this.url = business.url;
//   }
  
//   //////////errors
//   function handleError(error,response) {
//     console.log('error',error);
//     if(response){
//       response.status(500).send('sorry there is no data')
//     }
//   }

  