var moment = require( 'moment' ),
    getRiders = require( './riders' ),
    findApplicableStage = require( './findApplicableStage' ),
    call = require( './call' ),
    config = require( '../data/config.js' );

require( 'moment-duration-format' );

module.exports = function( state ){
  var stage = state.stage,

  getRiderForID = ( riders, id )=>{
    return riders.find( r => r.no === id );
  },

  buildTimeRank = ( riders, list, which )=>{
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
  },

  buildPointsRank = ( riders, list, which )=>{
    var pointsRank = [];

    for( var i = 0; i < list.length; i++ ){
     
      var riderData = getRiderForID( riders, list[ i ].r );
      riderData[ which ] = list[ i ].p;
      pointsRank.push( riderData );
    }

    return pointsRank;
  };

  return new Promise( ( resolve, reject )=>{
    getRiders( state ).then( ( riders )=>{
      
      // no riders, no rank
      if( riders.length === 0 ){
        resolve( {} );
      }

      findApplicableStage( state.stage, state.route, 'yesterday' ).then( ( stage )=>{

        call( `${config.baseUrl}/gprank${stage}.json`, 'rank' ).then( ( data )=>{
          var sprinters = ( data.ipg ) ? buildPointsRank( riders, data.ipg.r, 'sprint' ) : false,
              individual = ( data.itg ) ? buildTimeRank( riders, data.itg.r, 'individual' ) : false,
              climbers = ( data.img ) ? buildPointsRank( riders, data.img.r, 'climb' ) : false,
              white = ( data.ijg ) ? buildTimeRank( riders, data.ijg.r, 'white' ) : false;
          
          var ranks = {
              sprinters: sprinters,
              individual: individual,
              climbers: climbers,
              white: white
            };

          resolve( ranks );
        } )
        .catch( ( error )=>{
          console.log( error );
          // resolve no rank intead of killing the whole app
          resolve( {} );
        } );
    
      } );
    } );
  } );
};