import Stream from './components/stream';
import Progress from './components/progress';
import Rank from './components/rank';
import Fullscreen from './components/fullscreen';
import Notify from './components/notify';

class App{
  constructor(){
    this.io = require( 'socket.io-client' )( '//localhost:3000' );
  
    new Stream( this );
    new Progress( this );
    new Rank( this );
    new Fullscreen( this );
    new Notify( this );
  }
}

window.onload = ()=>{
  new App();
}