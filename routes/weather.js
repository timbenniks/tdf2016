"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    request = require( 'superagent' ),
    router = express.Router();

router.get( '/', ( req, res )=>{
  request
    .get( `http://fep-api.dimensiondata.com/race/6/stages/current` )
    .accept( 'application/json' )
    .end( ( err, state )=>{
       request
        .get( `http://fep-api.dimensiondata.com/stages/${state.body.StageId}/weather?DistanceFromStart=0` )
        .accept( 'application/json' )
        .end( ( err, weather )=>{
          var result = {
            temp: ( weather.body ) ? weather.body.Temperature : false, 
            wind: ( weather.body ) ? `${weather.body.AverageWindSpeed}km/h` : false,
            wind_direction: ( weather.body ) ? weather.body.WindDirection : false,
            humidity: ( weather.body ) ? weather.body.HumidityPercentage : false
          };

          res.json( result );
        });
    } );
} );

module.exports = router;


//http://fep-api.dimensiondata.com/race/6/stages/current
//http://fep-api.dimensiondata.com/stages/99/weather