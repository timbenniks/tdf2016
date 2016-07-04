"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    moment = require( 'moment' ),
    getDimensionDataState = require( '../modules/dimensionDataState' ),
    getDimensionDataRouteData = require( '../modules/dimensionDataRouteData' ),
    getDimensionDataGroups = require( '../modules/dimensionDataGroups' ),
    router = express.Router();

router.get( '/', ( req, res )=>{
  getDimensionDataState()
    .then( ( state )=>{
      var info = {
        date: moment( state.date ).format( "D MMMM YYYY" ),
        startsAt: state.startsAt,
        distance: state.distance,
        start: state.start,
        finish: state.finish
      }
      res.render( 'map', { state: state, info: info } );      
    } )
} );

router.get( '/groups', ( req, res )=>{
  getDimensionDataState()
    .then( getDimensionDataGroups )
    .then( ( groups )=>{
      res.json( groups );
    } )
} );

router.get( '/route', ( req, res )=>{
  getDimensionDataState()
    .then( getDimensionDataRouteData )
    .then( ( routeData )=>{
      var result = routeData.map( ( routePoint )=>{
        return {
          fs: routePoint.DistanceFromStart,
          tf: routePoint.DistanceToFinish,
          lat: routePoint.Latitude,
          lng: routePoint.Longitude,
          climb_cat: routePoint.ClimbCategory,
          alt: routePoint.Altitude,
          interest: ( routePoint.PointOfInterestType !== 0 ) ? routePoint.PointOfInterestType : false
        }
      } );

      res.json( result );
    } )
} );


module.exports = router;