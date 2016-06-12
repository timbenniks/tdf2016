import Stream from './components/stream';
import Progress from './components/progress';
import Rank from './components/rank';
import Fullscreen from './components/fullscreen';
import Notify from './components/notify';

class App{
  constructor(){
    this.io = require( 'socket.io-client' )( '//localhost:3000' );
    this.wrapper = document.querySelector( '.section-holder' );
  
    new Stream( this );
    new Rank( this );
    new Fullscreen( this );
    new Notify( this );

    if( this.wrapper.classList.contains( 'during' ) ){
      new Progress( this );
    }
  }
}

window.onload = ()=>{
  new App();
}