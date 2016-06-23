var getAppState = require( './state' ),
    getLiveNews = require( './liveNews' );

module.exports = function( io ){
  getAppState()
    .then( getLiveNews )
    .then( ( data )=>{
      io.sockets.emit( 'livenews', data );
    } )
    .catch( ( error )=>{
      io.sockets.emit( 'livenews.error', error );
    } );
}