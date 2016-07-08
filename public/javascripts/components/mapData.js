import request from 'superagent';
import 'babel-polyfill';

export default class DataHandler {
  constructor(){
    this.urls = {
      route: '/map/route/',
      groups: '/map/groups/',
      checkpoint: '/map/checkpoint/'
    }    
  }

  call( identifier, extraProp = '' ){
    return new Promise( ( resolve, reject )=>{
      request
        .get( this.urls[ identifier ] + extraProp )
        .accept( 'application/json' )
        .end( ( err, res )=>{
          if( err && err.status === 404 ){
            reject( `${identifier} not reachable. URL: ${this.urls[ identifier ]}` );
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
}