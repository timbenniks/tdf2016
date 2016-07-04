"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    call = require( './call' ),
    router = express.Router();

module.exports = function( state ){
  return new Promise( ( resolve, reject )=>{
    call( `${config.dimensionData.baseurl}/rider/${config.dimensionData.cours}`, 'Dimention Data riders' )
      .then( ( riders )=>{
        resolve( riders );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};