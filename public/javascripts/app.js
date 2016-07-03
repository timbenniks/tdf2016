import SocketHandler from './components/socketHandler';
import Stream from './components/stream';
import LiveNews from './components/livenews';
import Progress from './components/progress';
import Rank from './components/rank';
import Fullscreen from './components/fullscreen';
import Notify from './components/notify';
import Weather from './components/weather';
import Share from './components/share';
import Emitter from 'tiny-emitter';

class App {
  constructor(){
    
    this.io = require( 'socket.io-client' )( '//tims-tdf-2016.herokuapp.com' );    
    this.wrapper = document.querySelector( '.section-holder' );
    this.emitter = new Emitter();
    this.notifier = new Notify( this );

    if( this.wrapper.classList.contains( 'about' ) ){
      return;
    }

    new Fullscreen( this );
    new SocketHandler( this );

    if( this.wrapper.classList.contains( 'during' ) ){
      new Weather( this );
      new Rank( this );
      new Progress( this );

      if( this.wrapper.classList.contains( 'tweet-stream' ) ){
        new Stream( this );
      }
      else {
        this.sharer = new Share( this );
        new LiveNews( this );
      }
    }

    if( this.wrapper.classList.contains( 'after' ) ){
      new Weather( this );
      new Rank( this );
    }

    if( this.wrapper.classList.contains( 'rest' ) ){
      new Rank( this );
      new Stream( this );
    }

    if( this.wrapper.classList.contains( 'no-tour' ) ){
      new Stream( this );
    }
  }
}

require( 'domready' )( function(){
  new App();
} );