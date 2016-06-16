var moment = require( 'moment' ),
    getStageType = require( './getStageType' ),
    call = require( './call' ),
    config = require( '../data/config.js' ),
    getStartTime = require( './startTime' );

module.exports = function( state ){
  var route = state.route,
      stage = state.stage;

  return new Promise( ( resolve, reject )=>{
    
    getStartTime( state ).then( ( time )=>{

      call( `${config.baseUrl}/route.${route}.json`, 'route info' )
        .then( ( routeInfo )=>{
          var data = routeInfo[ stage ],
              stageData = {
                startsAt: time,
                type: getStageType( data.type ),
                distance: data.distance,
                date: moment( data.date ).format( "D MMMM YYYY" ),
                start: data.start,
                finish: data.finish
              };

          resolve( stageData );
        } )
        .catch( ( error )=>{
          reject( error );
        } );

    } )
    .catch( ( error )=>{
      reject( error );
    } );
  } );
};