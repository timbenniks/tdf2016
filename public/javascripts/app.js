import Stream from './components/stream';
import Progress from './components/progress';
import Rank from './components/rank';
import Fullscreen from './components/fullscreen';
import Notify from './components/notify';

class App {
  constructor(){
    this.io = require( 'socket.io-client' )( '//localhost:3000' );
    this.wrapper = document.querySelector( '.section-holder' );
  
    new Rank( this );
    new Fullscreen( this );
    
    if( this.wrapper.classList.contains( 'during' ) ){
      new Notify( this );
      new Stream( this );
      new Progress( this );
    }

    if( this.wrapper.classList.contains( 'rest' ) ){
      new Notify( this );
      new Stream( this );
    }
  }
}

window.onload = ()=>{
  new App();
}