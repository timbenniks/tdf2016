var getAppState = require( './state' ),
    getProgress = require( './progress' );

module.exports = function( pubSub, info ){
  getAppState()
    .then( getProgress )
    .then( ( data )=>{
      pubSub.emit( 'socket:progress', data );
    } )
    .catch( ( error )=>{
      pubSub.emit( 'socket:progress:error', error );
    } );
}