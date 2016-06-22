var getAppState = require( './state' ),
    getLiveNews = require( './liveNews' );

module.exports = function( socket ){
  getAppState()
    .then( getLiveNews )
    .then( ( data )=>{
      socket.emit( 'livenews', data );
    } )
    .catch( ( error )=>{
      socket.emit( 'livenews.error', error );
    } );
}