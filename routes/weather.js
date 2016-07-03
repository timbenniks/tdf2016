"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    request = require( 'superagent' ),
    cheerio = require( 'cheerio' ),
    router = express.Router();

router.get( '/', ( req, res )=>{
  request
    .get( `http://fep-api.dimensiondata.com/race/6/stages/current` )
    .accept( 'application/json' )
    .end( ( err, state )=>{
       request
        .get( `http://fep-api.dimensiondata.com/stages/${state.body.StageId}/weather` )
        .accept( 'application/json' )
        .end( ( err, weather )=>{
          var resut = {
            temp: weather.body.Temperature,
            wind: `${weather.body.AverageWindSpeed}km/h`,
            wind_direction: weather.body.WindDirection,
            humidity: weather.body.HumidityPercentage,
          };

          res.json( resut );
        });
    } );
} );

module.exports = router;


//http://fep-api.dimensiondata.com/race/6/stages/current
//http://fep-api.dimensiondata.com/stages/99/weather