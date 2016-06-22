var twitter = require( './twitter' ),
    TwitterHandler = new twitter();

module.exports = function( socket, query ){

  TwitterHandler.createStream( 'statuses/filter', query ).then( ( stream )=>{
    stream.on( 'data', ( tweet )=>{
      TwitterHandler.clean( tweet )
        .then( ( cleanTweet )=>{
          socket.emit( 'tweet', cleanTweet[ 0 ] );
        } )
        .catch( ( error )=>{
          socket.emit( 'error', error );
        } );
    } );
  } );

}