import GoogleMapsLoader from 'google-maps';
import 'babel-polyfill';

export default class MapsNews {
  constructor( mapHandler ){
    this.emitter = mapHandler.emitter;
    this.toggler = document.querySelector( '.map-show-news' );
    this.newsWrapper = document.getElementById( 'news-sidebar-holder' );
    this.bind();
    this.emitter.on( 'panels:rebind', this.rebind.bind( this ) );
    this.emitter.on( 'newsbanner:update', this.onNewNews.bind( this ) );
  }

  bind(){
    this.toggler.addEventListener( 'click', this.onTogglerClick.bind( this ) );
  }

  rebind(){
    this.toggler = document.querySelector( '.map-show-news' );
    this.toggler.removeEventListener( 'click', this.onTogglerClick.bind( this ) );
    this.bind();
  }

  onTogglerClick(){
    this.emitter.emit( 'panels:toggle' );
    this.newsWrapper.classList.add( 'active' );
  }

  deActivate(){
    if( this.newsWrapper.classList.contains( 'active' ) ){
      this.newsWrapper.classList.remove( 'active' ); 
    }
  }

  onNewNews(){}
}