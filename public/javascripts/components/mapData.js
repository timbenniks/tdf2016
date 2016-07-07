import request from 'superagent';
import 'babel-polyfill';

export default class DataHandler {
  constructor(){}

  getRouteData(){
    return new Promise( ( resolve, reject )=>{
      request
        .get( `/map/route` )
        .accept( 'application/json' )
        .end( ( err, res )=>{
          if( err ){ reject( err ); }
          resolve( res.body );
        } );
    } );
  }

  getGroups(){
    return new Promise( ( resolve, reject )=>{
      request
        .get( `/map/groups` )
        .accept( 'application/json' )
        .end( ( err, res )=>{
          if( err ){ reject( err ); }
          resolve( res.body );
        } );
    } );
  }

  getCheckpoint( id ){
    return new Promise( ( resolve, reject )=>{
      request
        .get( `/map/checkpoint/${id}` )
        .accept( 'application/json' )
        .end( ( err, res )=>{
          if( err ){ reject( err ); }
          resolve( res.body );
        } );
    } );
  }
}