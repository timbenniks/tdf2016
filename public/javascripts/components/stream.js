import 'babel-polyfill';
import tweetTmpl from '../../../views/includes/tweet.jade';

export default class Stream {
  constructor( app ){
    this.stream = document.querySelector( '.stream' );
    this.items = this.stream.getElementsByTagName( 'blockquote' );
    this.emitter = app.emitter;
    this.bind();
  }

  bind(){
    this.emitter.on( 'socket:tweet', ( data )=>{
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
    this.stream.insertAdjacentHTML( 'afterbegin', tweetHtml );
    this.cleanUp();
  }

  cleanUp(){
    this.items = this.stream.getElementsByTagName( 'blockquote' );

    if( this.items.length < 30 ){
      return;
    }

    for( var i = 0; i < this.items.length; i++ ){
      if( i > 30 ){
        this.stream.removeChild( this.items[ i ] );
      }
    }
  }
}