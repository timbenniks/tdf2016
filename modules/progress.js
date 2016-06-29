var moment = require( 'moment' ),
    call = require( './call' ),
    riders = require( './riders' ),
    config = require( '../data/config.js' );

require( 'moment-duration-format' );

module.exports = function( state ){
  var stage = state.stage,
  
  getRiderForID = ( riders, id )=>{
    return riders.find( r => r.no === id );
  };

  return new Promise( ( resolve, reject )=>{
    riders( state )
      .then( ( riders )=>{

        // no riders, no progress...
        if( riders.length === 0 ){
          resolve( {} );
        }

        call( `${config.baseUrl}/livestage${stage}.json`, 'progress' )
          .then( ( data )=>{

            var progress = {
              speed: ( data.s ) ? ( data.s / 1000 ).toFixed( 1 ) : 0,
              kmCompleted: ( data.kp ) ? data.kp : 0,
              kmRemaining: ( data.kr ) ? data.kr : 0,
              groups: []
            };

            if( data.g ){
              data[ 'g' ].forEach( ( group )=>{
                var mappedRiders = [];

                if( group.r ){
                  mappedRiders = group.r.map( ( rider )=>{
                    var updatedRider = getRiderForID( riders, rider.r );
                    updatedRider.behind = `+${moment.duration( rider.t, 'seconds' ).format( 'hh:mm:ss', { trim: false } )}`;

                    return updatedRider;
                  } );
                }

                progress.groups.push({
                  title: group.t,
                  runnersNo: ( group.n ) ? group.n : 0,
                  delay: ( group.d ) ? moment.duration( group.d, 'seconds' ).format( 'mm:ss', { trim: false } ) : '04:11',
                  jerseys: ( group.j ) ? group.j.split( '' ) : [],
                  riders: mappedRiders
                } );
              } );

              progress.groups = progress.groups;
            }

            progress.stage = stage;

            resolve( progress );
          } )
          .catch( ( error )=>{
            reject( error );
          } );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
}