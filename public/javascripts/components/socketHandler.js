export default class SocketHandler {
  constructor( app ){
    this.io = app.io;
    this.emitter = app.emitter;

    this.io.on( 'tweet', ( data )=>{
      this.emitEvent( 'socket:tweet', data );
    } );

    this.io.on( 'livenews', ( data )=>{
      this.emitEvent( 'socket:livenews', data );
    } );

    this.io.on( 'progress', ( data )=>{
      this.emitEvent( 'socket:progress', data );
    } );

    this.io.on( 'connected', ( data )=>{
      ga('send', 'event', 'socket user', 'connected', data.id );
      console.info( `User ${data.id} has connected, starting stream.` );
      this.emitToSocket( 'start-stream' );
    } );

  }

  emitEvent( message, data ){
    this.emitter.emit( message, data );
  }

  emitToSocket( message ){
    if( this.io ){
      this.io.emit( message );
    }
    else {
      console.info( 'No socket connection yet, trying again in 500ms.' );
      setTimeout( ()=>{
        this.emitToSocket( message );
      }, 500 );
    }
  }
}