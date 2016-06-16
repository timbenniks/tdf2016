var request = require( 'superagent' );

module.exports = function( url, identifier ){

  return new Promise( ( resolve, reject )=>{
    request
      .get( url )
      .accept( 'application/json' )
      .end( ( err, res )=>{
        if( err && err.status === 404 ){
          reject( `${identifier} not reachable. URL: ${url}` );
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