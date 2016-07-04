"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    call = require( './call' ),
    getDimensionDataRiders = require( './dimensionDataRiders' ),
    router = express.Router();

module.exports = function( state ){
  var raceURL = state.raceURL;

  return new Promise( ( resolve, reject )=>{
    getDimensionDataRiders()
      .then( ( riders )=>{

        call( raceURL, 'Dimension Data Groups' )
          .then( ( groups )=>{
            resolve( { riders: riders, groups: groups } );
          } )
          .catch( ( error )=>{
            reject( error );
          } );

      } )
      .catch( ( error )=>{
        reject( error )
      } );
    
  } );
};