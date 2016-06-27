var getAppState = require( './state' ),
    getLiveNews = require( './liveNews' );

module.exports = function( pubSub ){
  getAppState()
    .then( getLiveNews )
    .then( ( data )=>{
      pubSub.emit( 'socket:livenews', data );
    } )
    .catch( ( error )=>{
      pubSub.emit( 'socket:livenews:error', error );
    } );
}