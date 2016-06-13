import Masonry from 'masonry-layout';
import 'babel-polyfill';
import tweetTmpl from '../../../views/includes/tweet.jade';

export default class RestStream {
  constructor( app ){
    this.io = app.io;
    this.bind();

    this.grid = document.querySelector( '.stream-holder' );
    this.msnry = new Masonry( this.grid, {
      itemSelector: 'blockquote',
      columnWidth: '.grid-sizer',
      percentPosition: true,
      gutter: 10
    });
  }

  bind(){
    this.io.on( 'tweet', ( data )=>{
      this.renderTweet( data )
        .then( this.placeTweet.bind( this ) )
        .catch( ( error )=>{
          console.error( error );
        } );
    } );
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
    this.msnry.layout();
  }
}