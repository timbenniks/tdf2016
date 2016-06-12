var moment = require( 'moment' ),
    riders = require( './riders' ),
    call = require( './call' );

require( 'moment-duration-format' );

module.exports = function( state, currentStage ){
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
      
      var riderTimeData = getRiderForID( riders, list[ i ].r );
      riderTimeData[ `${which}-time`] = moment.duration( list[ i ].s, 'seconds' ).format( 'hh:mm:ss' );
      
      if( i !== 0 ){
        riderTimeData[ `${which}-behind`] = '+ ' + moment.duration( list[ i ].s, 'seconds' ).subtract( firstRiderTime ).format( 'hh:mm:ss' );
      }

      rankTime.push( riderTimeData );
    }

    return rankTime;
  }

  const buildPointsRank = ( riders, list, which )=>{
    var pointsRank = [];

    for( var i = 0; i < list.length; i++ ){
      var riderPointData = getRiderForID( riders, list[ i ].r );
      riderPointData[ which ] = list[ i ].p;
      pointsRank.push( riderPointData );
    }

    return pointsRank;
  }

  return new Promise( ( resolve, reject )=>{
    riders( state )
      .then( ( riders )=>{
        
        var stageToQueryFor = ( currentStage ) ? stage : prevStage;

        call( `http://www.letour.fr/useradgents/2015/json/gprank${stageToQueryFor}.json`, 'rank' )
          .then( ( data )=>{
            var green = buildPointsRank( riders, data.ipg.r, 'sprint' ),
                yellow = buildTimeRank( riders, data.itg.r, 'individual' ),
                polka_dot = buildPointsRank( riders, data.img.r, 'climb' ),
                white = buildTimeRank( riders, data.ijg.r, 'white' )
                jerseys = {
                  green: green[ 0 ],
                  yellow: yellow[ 0 ],
                  polka_dot: polka_dot[ 0 ],
                  white: white[ 0 ]
                };

            resolve( jerseys );
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