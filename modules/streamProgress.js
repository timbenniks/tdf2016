var getAppState = require( './state' ),
    getProgress = require( './progress' );

module.exports = function( socket, info ){
  getAppState()
    .then( getProgress )
    .then( ( data )=>{
      socket.emit( 'progress', data );
    } )
    .catch( ( error )=>{
      socket.emit( 'progress.error', error );
    } );
}