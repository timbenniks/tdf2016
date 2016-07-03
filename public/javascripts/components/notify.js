const Notify = require( 'notifyjs' ).default;

export default class Notifications {
  constructor( app ){
    this.button = document.querySelector( 'button.notifications' );

    if( !( 'Notification' in window ) ){
      this.button.style.display = 'none';
      return false;
    }

    this.bind(); 

    if( !Notify.needsPermission ){
      this.button.style.display = 'none';
    }
  }

  bind(){
    this.button.addEventListener( 'click', ()=>{
      this.notify( 'Notifications are turned on', '' );
      this.button.style.display = 'none';
    } );
  }

  notify( text, title ){
    if( !( 'Notification' in window ) ){
      return false;
    }

    if( !Notify.needsPermission ){
      let notification = new Notify( `Tim\'s TDF 2016 ${title}`, {
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