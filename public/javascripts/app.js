import SocketHandler from './components/socketHandler';
import Stream from './components/stream';
import LiveNews from './components/livenews';
import Progress from './components/progress';
import Rank from './components/rank';
import Fullscreen from './components/fullscreen';
import Notify from './components/notify';
import Emitter from 'tiny-emitter';

class App {
  constructor(){
    this.io = require( 'socket.io-client' )( '//tims-tdf-2016.herokuapp.com' );
    this.wrapper = document.querySelector( '.section-holder' );
    this.emitter = new Emitter();

    new Fullscreen( this );
    new SocketHandler( this );

    if( this.wrapper.classList.contains( 'during' ) ){
      new Rank( this );
      new Notify( this );
      new Progress( this );

      if( this.wrapper.classList.contains( 'tweet-stream' ) ){
        new Stream( this );
      }
      else {
        new LiveNews( this );
      }
    }

    if( this.wrapper.classList.contains( 'rest' ) ){
      new Rank( this );
      new Notify( this );
      new Stream( this );
    }

    if( this.wrapper.classList.contains( 'no-tour' ) ){
      new Stream( this );
    }
  }
}

window.onload = ()=>{
  new App();
}