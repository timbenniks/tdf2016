import 'babel-polyfill';
import tweetTmpl from '../../../views/includes/tweet.jade';

export default class Stream {
  constructor( app ){
    this.io = app.io;
    this.bind();
  }

  bind(){
    this.io.on( 'tweet', ( data )=>{
      if( !this.tweetInDom( data.id ) ){
        this.renderTweet( data )
          .then( this.placeTweet.bind( this ) )
          .catch( ( error )=>{
            console.error( error );
          } );
        }
    } );
  }

  tweetInDom( id ){
    return !!document.getElementById( id );
  }

  renderTweet( data ){
    return new Promise( ( resolve, reject )=>{
      if( !data ){
        reject( 'Did not get proper tweet data' );
      }

      resolve( tweetTmpl( { tweet: data } ) );
    } );
  }

  placeTweet( tweetHtml ){
    document.querySelector( '.stream' ).insertAdjacentHTML( 'afterbegin', tweetHtml );
  }
}