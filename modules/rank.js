var request = require( 'superagent' ),
    moment = require( 'moment' ),
    riders = require( './riders' ),
    call = require( './call' );

require( 'moment-duration-format' );

module.exports = function( state ){
  var stage = state.stage,
      prevStage = ( stage > 0100 ) ? stage - 100 : stage;

  const getRiderForID = ( riders, id )=>{
    var result;

    riders.forEach( ( rider )=>{
      if( rider.no === id ){
        result = rider;
      }
    } );

    return result;
  };

  const buildTimeRank = ( riders, list, which )=>{
    var rankTime = [];

    for( var i = 0; i < list.length; i++ ){
      if( i === 0 ){
        firstRiderTime = moment.duration( list[ i ].s, 'seconds' );
      }
      
      var riderData = getRiderForID( riders, list[ i ].r );
      riderData[ `${which}-time`] = moment.duration( list[ i ].s, 'seconds' ).format( 'hh:mm:ss' );
      
      if( i !== 0 ){
        riderData[ `${which}-behind`] = '+ ' + moment.duration( list[ i ].s, 'seconds' ).subtract( firstRiderTime ).format( 'hh:mm:ss' );
      }

      rankTime.push( riderData );
    }

    return rankTime;
  }

  const buildPointsRank = ( riders, list, which )=>{
    var pointsRank = [];

    for( var i = 0; i < list.length; i++ ){
     
      var riderData = getRiderForID( riders, list[ i ].r );
      riderData[ which ] = list[ i ].p;
      pointsRank.push( riderData );
    }

    return pointsRank;
  }

  return new Promise( ( resolve, reject )=>{
    riders( state )
      .then( ( riders )=>{
        call( `http://www.letour.fr/useradgents/2015/json/gprank${prevStage}.json`, 'rank' )
          .then( ( data )=>{
            var sprinters = buildPointsRank( riders, data.ipg.r, 'sprint' ),
                individual = buildTimeRank( riders, data.itg.r, 'individual' ),
                climbers = buildPointsRank( riders, data.img.r, 'climb' ),
                white = buildTimeRank( riders, data.ijg.r, 'white' )
                ranks = {
                  sprinters: sprinters,
                  individual: individual,
                  climbers: climbers,
                  white: white
                };

            resolve( ranks );

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