var getAppState = require( './state' ),
    getProgress = require( './progress' );

module.exports = function( io, info ){
  getAppState()
    .then( getProgress )
    .then( ( data )=>{
      io.sockets.emit( 'progress', data );
    } )
    .catch( ( error )=>{
      io.sockets.emit( 'progress.error', error );
    } );
}