"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    call = require( './call' ),
    router = express.Router();

module.exports = function( state ){
  var routeURL = `http:${state.routeURL}`;

  return new Promise( ( resolve, reject )=>{
    call( routeURL, 'Dimention Data Route' )
      .then( ( routeData )=>{
        resolve( routeData );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};