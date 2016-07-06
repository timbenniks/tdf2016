"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    call = require( './call' ),
    router = express.Router();

module.exports = function( id ){
  return new Promise( ( resolve, reject )=>{
    call( `${config.dimensionData.baseurl}/checkpoints/${id}`, 'Dimention Data checkpoint' )
      .then( ( checkpoint )=>{
        resolve( checkpoint );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};