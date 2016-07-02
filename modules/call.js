var request = require( 'superagent' ),
    config = require( '../data/config.js' );

module.exports = function( url, identifier ){

  return new Promise( ( resolve, reject )=>{
    request
      .get( url.replace( '$$year$$', config.year ) + '?_=' + Date.now().toString() )
      .accept( 'application/json' )
      .end( ( err, res )=>{
        if( err && err.status === 404 ){
          reject( `${identifier} not reachable. URL: ${url.replace( '$$year$$', config.year )}` );
        }
        else if( err ) {
          reject( `Something went wrong while getting the ${identifier}. Error: ${err}` );
        }
        try {
          resolve( res.body );
        }
        catch( e ){
          console.log( 'error:', e );
          reject( `Something went wrong while getting the ${identifier}. Error: ${err}` );
        }
      } );
  } );

}