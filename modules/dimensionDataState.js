"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    call = require( './call' ),
    router = express.Router();

module.exports = function(){
  return new Promise( ( resolve, reject )=>{
    call( `${config.dimensionData.baseurl}/race/${config.dimensionData.cours}/stages/current`, 'Dimention Data state' )
      .then( ( state )=>{
        resolve( {
          stage: state.StageId,
          prevStage: state.PreviousStageId,
          date: state.StageDate,
          startsAt: state.StageStartTime,
          start: state.DepartingTown,
          finish: state.ArrivingTown,
          distance: state.TotalDistance,
          routeURL: state.StageRouteUri,
          raceURLAso: `${state.RaceUri}?datasource=aso`,
          raceURL: state.RaceUri,
          ridersUrl: `${config.dimensionData.baseurl}/rider/${config.dimensionData.cours}`
        } );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};