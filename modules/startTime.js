var call = require( './call' ),
    moment = require( 'moment' ),
    config = require( '../data/config.js' );

module.exports = function( state ){
  var stage = state.stage,
      checkpoints = state.checkpoints;
      
  return new Promise( ( resolve, reject )=>{
    call( `${config.baseUrl}/checkpoints.${checkpoints}.json`, 'checkpoints' )
      .then( ( checkpoints )=>{

        var time = false,
            cp = checkpoints[ stage ].cp;

        if( stage === '00R1' || stage === '00R2' ){
          resolve( time );
        }

        for( var i = 0; i < cp.length; i++ ){
          if( cp[ i ].h ){
            time = cp[ i ].h[ 0 ]
            break;
          }
        }

        if( time ){
          resolve( moment.duration( time, 'seconds' ).format( 'mm:ss', { trim: false } ) );
        }
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};