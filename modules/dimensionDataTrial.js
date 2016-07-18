"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    call = require( './call' ),
    moment = require( 'moment' ),
    getDimensionDataState = require( '../modules/dimensionDataState' ),
    router = express.Router();

module.exports = function(){
  return new Promise( ( resolve, reject )=>{
    getDimensionDataState()
      .then( ( state )=>{
        call( `${config.dimensionData.baseurl}/trial/${state.stage}`, 'Dimention Data Time Trial' )
          .then( ( trialData )=>{
            
            var result = {
              ridersInrace: trialData.NumberOfRidersRacing,
              toStart: [],
              completed: [],
              checkpoints: []
            }

            for( var i = 0; i < trialData.CheckPoints.length; i++ ){
              var checkpoint = trialData.CheckPoints[ i ];
              
              result.checkpoints.push({
                id: checkpoint.CheckPointId,
                fromStart: checkpoint.DistanceFromStart,
                toFinish: checkpoint.DistanceToFinish,
                ridersPast: checkpoint.NumberOfRidersPassed,
                riders: []
              } );
            }

            for( var i = 0; i < trialData.CheckPoints.length; i++ ){
              var riders = trialData.CheckPoints[ i ].Riders;

              for( var r = 0; r < riders.length; r++ ){
                var rider = riders[ r ];
                
                result.checkpoints[ i ].riders.push({
                  id: rider.RiderBibNumber,
                  position: ( rider.position ) ? rider.position : false,
                  status: 'riding',
                  fromBestRider: ( rider.PointGapFromBestRider ) ? rider.PointGapFromBestRider : false,
                  startTime: ( rider.ActualStartTime ) ? rider.ActualStartTime : false,
                  timeFromStart: ( rider.PointTimeFromStart ) ? rider.PointTimeFromStart : false,
                  scheduledToStart: false
                } );
              }
            }

            for( var i = 0; i < trialData.RidersStillToStart.length; i++ ){
              var rider = trialData.RidersStillToStart[ i ];
              result.toStart.push({
                id: rider.RiderBibNumber,
                position: ( rider.position ) ? rider.position : false,
                status: ( rider.ClassificationStatus ) ? rider.ClassificationStatus : false,
                fromBestRider: ( rider.GapFromBestRider ) ? rider.GapFromBestRider : false,
                startTime: ( rider.ActualStartTime ) ? rider.ActualStartTime : false,
                timeFromStart: ( rider.TimeFromStart ) ? rider.TimeFromStart : false,
                scheduledToStart: ( rider.ScheduledStartTime ) ? rider.ScheduledStartTime : false
              } );
            }

            for( var i = 0; i < trialData.RidersCompleted.length; i++ ){
              var rider = trialData.RidersCompleted[ i ];
              result.completed.push({
                id: rider.RiderBibNumber,
                position: ( rider.position ) ? rider.position : false,
                status: ( rider.ClassificationStatus ) ? rider.ClassificationStatus : false,
                fromBestRider: ( rider.GapFromBestRider ) ? rider.GapFromBestRider : false,
                startTime: ( rider.ActualStartTime ) ? rider.ActualStartTime : false,
                timeFromStart: ( rider.TimeFromStart ) ? rider.TimeFromStart : false,
                scheduledToStart: ( rider.ScheduledStartTime ) ? rider.ScheduledStartTime : false
              } );
            }

            resolve( result );
          } )
          .catch( ( error )=>{
            reject( error );
          } )
        .catch( ( error )=>{
          reject( error );
        } );
    } );
  } );
};