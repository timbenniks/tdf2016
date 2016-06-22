const Notify = require( 'notifyjs' ).default;

export default class Notifications {
  constructor( app ){
    this.button = document.querySelector( 'button.notifications' );
    this.io = app.io;
    this.currentProgress = '';
    this.currentLiveNews = '';

    this.bind(); 

    if( !Notify.needsPermission ){
      this.button.style.display = 'none';
    }
  }

  bind(){
    this.io.on( 'tweet', ( data )=>{
      this.notify( data.raw, 'update' );
    } );

    this.io.on( 'progress', ( data )=>{
      if( this.currentProgress !== JSON.stringify( data ) ){
        this.currentProgress = JSON.stringify( data );
        
        var text = '';

        if( data.groups.length === 1 ){
          return;
        }

        data.groups.forEach( ( group, index )=>{
          if( index === 0 ){
            text += `${group.title} (${group.runnersNo})\n`;
          }
          else {
            text += `${group.title} (${group.runnersNo}) at ${ group.delay }\n`;
          }
        } );

        this.notify( text, 'groups' );
      }
    } );

    this.io.on( 'livenews', ( data )=>{
      if( this.currentLiveNews !== JSON.stringify( data ) ){
        this.currentLiveNews = JSON.stringify( data );
        this.notify( `${data[ 0 ].time}: ${data[ 0 ].title}\n${data[ 0 ].desc.replace( /\n\n/g, '\n' )}`, 'news' );
      }
    } );

    this.button.addEventListener( 'click', ()=>{
      this.notify( 'Notifications are turned on', '' );
      this.button.style.display = 'none';
    } );
  }

  notify( text, title ){
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