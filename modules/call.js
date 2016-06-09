var request = require( 'superagent' );

module.exports = function( url, identifier ){

  return new Promise( ( resolve, reject )=>{
    request
      .get( url )
      .accept( 'application/json' )
      .end( ( err, res )=>{
        if( err && err.status === 404 ){
          reject( `${identifier} not reachable.` );
        }
        else if( err ) {
          reject( `Something went wrong while getting the ${identifier}.` );
        }

        if( !res ){
          reject( `Something went wrong while getting the ${identifier}.` );
        }

        if( typeof res === 'undefined' ){
          reject( `Something went wrong while getting the ${identifier}.` );
        }

        if( typeof res === null ){
          reject( `Something went wrong while getting the ${identifier}.` );
        }

        if( !res.ok ){
          reject( `Something went wrong while getting the ${identifier}.` );
        }

        if( !res.body ){
          reject( `Something went wrong while getting the ${identifier}.` );
        }
        
        resolve( res.body );
      } );
  } );

}