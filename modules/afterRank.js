var moment = require( 'moment' ),
    riders = require( './riders' ),
    call = require( './call' ),
    config = require( '../data/config.js' );

require( 'moment-duration-format' );

module.exports = function( state ){
  var stage = state.stage;
  
  var getRiderForID = ( riders, id )=>{
    return riders.find( r => r.no === id );
  },

  buildTimeRank = ( riders, list )=>{
    var rankTime = [];
    for( var i = 0; i < list.length; i++ ){
      if( i === 0 ){
        firstRiderTime = moment.duration( list[ i ].s, 'seconds' );
      }

      var riderData = getRiderForID( riders, list[ i ].r );
      riderData[ 'time' ] = moment.duration( list[ i ].s, 'seconds' ).format( 'hh:mm:ss' );
      
      if( i !== 0 ){
        var behind = '+ ' + moment.duration( list[ i ].s, 'seconds' ).subtract( firstRiderTime ).format( 'hh:mm:ss' );

        if( behind === '+ 00' ){
          behind = '';
        }

        riderData[ 'behind' ] = behind;
      }

      rankTime.push( riderData );
    }

    return rankTime;
  };

  return new Promise( ( resolve, reject )=>{
    riders( state )
      .then( ( riders )=>{
        call( `${config.baseUrl}/afterrank${stage}.json`, 'rank' )
          .then( ( data )=>{
            var rank = false;
            if( data.ite ){
              rank = buildTimeRank( riders, data.ite.r );
            }

            resolve( rank );
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