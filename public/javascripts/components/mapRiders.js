import 'babel-polyfill';

export default class MapsRiders {
  constructor( mapHandler ){
    this.emitter = mapHandler.emitter;
    this.toggler = document.querySelector( '.map-show-riders' );
    this.ridersWrapper = document.getElementById( 'riders-sidebar-holder' );
    this.bind();
    this.emitter.on( 'panels:rebind', this.rebind.bind( this ) );
  }

  bind(){
    this.toggler.addEventListener( 'click', this.onTogglerClick.bind( this ) );
  }

  rebind(){
    this.toggler = document.querySelector( '.map-show-riders' );
    this.toggler.removeEventListener( 'click', this.onTogglerClick.bind( this ) );
    this.bind();
  }

  onTogglerClick(){
    this.emitter.emit( 'panels:toggle' );
    this.ridersWrapper.classList.add( 'active' );
  }

  deActivate(){
    this.ridersWrapper.classList.remove( 'active' );
  }
}