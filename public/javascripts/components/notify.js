const Notify = require( 'notifyjs' ).default;

export default class Notifications {
  constructor( app ){
    this.button = document.querySelector( 'button.notifications' );
    this.io = app.io;
    this.currentProgress = '';

    this.bind(); 

    if( !Notify.needsPermission ){
      this.button.style.display = 'none';
    }
  }

  bind(){
    this.io.on( 'tweet', ( data )=>{
      if( !Notify.needsPermission ){
        this.notify( data.text );
      }
    } );

    this.io.on( 'progress', ( data )=>{
      if( this.currentProgress !== JSON.stringify( data ) ){
        this.currentProgress = JSON.stringify( data );
        
        if( data.groups.length > 1 ){
          let group = data.groups[ data.groups.length - 1 ].title,
              time = data.groups[ data.groups.length - 2 ].delay;
          this.notify( `${group} at ${time} from persuers` );
        }
      }
    } );

    this.button.addEventListener( 'click', ()=>{
      this.notify( 'Notifications are turned on' );
      this.button.style.display = 'none';
    } );
  }

  notify( text ){
    if( !Notify.needsPermission ){
      let notification = new Notify( 'Tim\'s TDF 2016', {
        body: text,
        tag: Math.random(),
        icon: '/icons/apple-icon-180x180.png',
        timeout: 5
      });

      notification.show();
    }
    else {
      Notify.requestPermission();
    }
  }
}