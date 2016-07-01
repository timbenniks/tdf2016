var call = require( './call' ),
    moment = require( 'moment' ),
    config = require( '../data/config.js' );

module.exports = function( state ){
  var stage = state.stage,
      route = state.route;
      
  return new Promise( ( resolve, reject )=>{
    call( `${config.baseUrl}/route.${route}.json`, 'checkpoints' )
      .then( ( route )=>{

        var time = false;

        if( stage === '00R1' || stage === '00R2' ){
          resolve( time );
        }

        time = route[ stage ].startTime;

        if( time ){
          resolve( moment.duration( time, 'seconds' ).format( 'mm:ss', { trim: false } ) );
        }
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};