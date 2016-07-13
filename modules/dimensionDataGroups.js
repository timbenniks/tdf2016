"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    call = require( './call' ),
    getDimensionDataRiders = require( './dimensionDataRiders' ),
    router = express.Router();

module.exports = function( state ){
  var raceURL = `http:${state.raceURL}`,
      altRadeURL = `http:${state.raceURLAso}`,
      today = new Date();

  return new Promise( ( resolve, reject )=>{
    getDimensionDataRiders()
      .then( ( riders )=>{

        call( raceURL, 'Dimension Data Groups' )
          .then( ( groups )=>{
            var resultTimeStamp = new Date( groups.TimeStamp );
            
            if( today.setHours( 0, 0, 0, 0 ) !== resultTimeStamp.setHours( 0, 0, 0, 0 ) ){

              console.log( `Using ${altRadeURL} for groups because ${raceURL} has not yet been updated with the latest data...` );

              call( altRadeURL, 'Dimension Data Alt Groups' )
                .then( ( groups )=>{
                  resolve( { riders: riders, groups: groups } );
                } )
                .catch( ( error )=>{
                  reject( error );
                } );
            }
            else {
              resolve( { riders: riders, groups: groups } );
            }
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