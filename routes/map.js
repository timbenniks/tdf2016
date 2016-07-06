"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    moment = require( 'moment' ),
    getDimensionDataState = require( '../modules/dimensionDataState' ),
    getDimensionDataRouteData = require( '../modules/dimensionDataRouteData' ),
    getDimensionDataGroups = require( '../modules/dimensionDataGroups' ),
    getDimensionDataCheckpoint = require( '../modules/dimensionDataCheckpoint' ),
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
      res.render( 'map', { title: 'Tim\'s TDF 2016', state: state, info: info } );      
    } )
} );

router.get( '/groups', ( req, res )=>{
  getDimensionDataState()
    .then( getDimensionDataGroups )
    .then( ( groups )=>{
      var riders = groups.riders,
          groups = groups.groups,
          mappedGroups = [],

      getRiderForBib = ( bib )=>{
        return riders.find( r => r.Id === bib );
      },

      capitalize = function( str ){
        var s = str.toLowerCase(); 
        return s.charAt( 0 ).toUpperCase() + s.slice( 1 );
      };

      if( !groups.Groups ){
        res.json( mappedGroups );
      }

      groups.Groups.forEach( ( group )=>{
        mappedGroups.push({
          name: group.GroupName,
          key: group.GroupNameKey,
          slope: group.Slope,
          avgSpeed: group.GroupAverageSpeed.toFixed( 1 ),
          speed: group.GroupSpeed.toFixed( 1 ),
          distFromStart: group.GroupDistanceFromStart.toFixed( 1 ),
          distToFinish: group.GroupDistanceToFinish.toFixed( 1 ),
          gapPrevGroupDist: ( group.GapPreviousGroupD ) ? group.GapPreviousGroupD.toFixed( 1 ) : false,
          gapNextGroupDist: ( group.GapFromNextGroupD ) ? group.GapFromNextGroupD .toFixed( 1 ): false,
          gapLeadingGroupTime: ( group.GapToLeadingGroupT ) ? moment.duration( group.GapToLeadingGroupT, 'seconds' ).format( 'mm:ss', { trim: false } ) : false,
          gapNextGroupTime: ( group.GapToPreviousGroupT ) ? moment.duration( group.GapToPreviousGroupT, 'seconds' ).format( 'mm:ss', { trim: false } ) : false,
          id: group.GroupId,
          lat: group.GroupLatitude,
          lng: group.GroupLongitude,
          size: group.GroupSize,
          jerseys: {
            yellow: group.HasGeneralClassificationJersey,
            polka_dot: group.HasMountainJersey,
            green: group.HasSprintJersey,
            white: group.HasYouthJersey
          },
          riders: group.Riders.map( ( rider )=>{
            return {
              speed: ( rider.CurrentSpeed ) ? rider.CurrentSpeed.toFixed( 1 ) : false,
              bib: rider.Bib,
              posInGroup: ( rider.PositionInTheGroup ) ? rider.PositionInTheGroup : false,
              name: getRiderForBib( rider.Bib ).FirstName + ' ' + capitalize( getRiderForBib( rider.Bib ).LastName ), 
              team: getRiderForBib( rider.Bib ).TeamName,
              teamCode: getRiderForBib( rider.Bib ).TeamCode,
              countryCode: getRiderForBib( rider.Bib ).CountryCode.toLowerCase(),
              photo: getRiderForBib( rider.Bib ).PhotoUri,
              classificationGeneral: getRiderForBib( rider.Bib ).GeneralClassification,
              classfication:{
                yellow: getRiderForBib( rider.Bib ).GeneralClassificationRank,
                green: getRiderForBib( rider.Bib ).SprintClassificationRank,
                white: getRiderForBib( rider.Bib ).YouthClassificationRank,
                polka_dot: getRiderForBib( rider.Bib ).MountainClassificationRank
              }
            }
          } )
        } );
      } );

      res.json( mappedGroups );
    } )
} );

router.get( '/checkpoint/:id', ( req, res )=>{
  getDimensionDataCheckpoint( req.params.id )
    .then( ( cp )=>{
      res.json( {
        id: cp.CheckpointId,
        name: cp.CheckpointName,
        classification: cp.Classification.trim(),
        alt: cp.Level,
        howFar: cp.Length,
        angle: cp.Angle,
        arrivals: cp.Arrivals
      } );
    } );
} );

router.get( '/route', ( req, res )=>{
  getDimensionDataState()
    .then( getDimensionDataRouteData )
    .then( ( routeData )=>{
      var route = [],
          pointsOfInterest = [];

      routeData.forEach( ( routePoint )=>{
        route.push({
          lat: routePoint.Latitude,
          lng: routePoint.Longitude
        } );

        if( routePoint.PointOfInterestType !== 0 ){
          pointsOfInterest.push({
            fs: routePoint.DistanceFromStart,
            tf: routePoint.DistanceToFinish,
            lat: routePoint.Latitude,
            lng: routePoint.Longitude,
            climb_cat: ( routePoint.ClimbCategory !== 0 ) ? routePoint.ClimbCategory : false,
            alt: routePoint.Altitude,
            type: ( routePoint.PointOfInterestType === 1 ) ? 'sprint' : 'climb',
            checkpoint_id: routePoint.PointOfInterestPK
          } );
        }
      } );   

      res.json( {
        route: route,
        pointsOfInterest: pointsOfInterest
      } );
    } )
} );


module.exports = router;