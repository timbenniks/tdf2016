var twitter = require( './twitter' ),
    TwitterHandler = new twitter();

module.exports = function( io, query ){

  TwitterHandler.createStream( 'statuses/filter', query ).then( ( stream )=>{
    stream.on( 'data', ( tweet )=>{
      TwitterHandler.clean( tweet )
        .then( ( cleanTweet )=>{
          io.sockets.emit( 'tweet', cleanTweet[ 0 ] );
        } )
        .catch( ( error )=>{
          io.sockets.emit( 'error', error );
        } );
    } );
  } );

}