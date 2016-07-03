"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    request = require( 'superagent' ),
    cheerio = require( 'cheerio' ),
    router = express.Router();

router.get( '/', ( req, res )=>{
  request
    .get( `http://www.letour.fr/le-tour/2016/us/200/colonne/col-meteo.html?_=${Date.now().toString()}` )
    .accept( 'text/html' )
    .end( ( err, data )=>{
      var $ = cheerio.load( data.text );
      res.json( { temp: $( '.num' ).text(), wind: $( '.vent' ).text().replace( 'Wind : ', '' ) } );
    } );
} );

module.exports = router;