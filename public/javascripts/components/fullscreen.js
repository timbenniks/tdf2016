import screenfull from 'screenfull';

export default class Fullscreen {
  constructor( app ){
    this.button = document.querySelector( 'button.fullscreen' );

    this.bind();
    this.fullscreenMode = false;
    window.addEventListener( 'resize', this.checkSize.bind( this ) );
  }

  checkSize(){
    if( this.fullscreenMode ){
      return;
    }

    if( window.matchMedia( "(max-width: 1000px)" ).matches ){
      this.button.style.display = 'none';
    }
    else {
      this.button.style.display = 'inline-block';
    }
  }

  bind(){
    this.button.addEventListener( 'click', this.onClickFullscreen.bind( this ) );

    document.addEventListener( screenfull.raw.fullscreenchange, () => {
      if( screenfull.isFullscreen ){
        this.button.style.display = 'none';
      }
      else {
        this.button.style.display = 'inline-block';
      }
    } );
  }

  onClickFullscreen( e ){
    e.preventDefault();

    if( screenfull.enabled ){
      this.fullscreenMode = true;
      screenfull.request();
    }
  }
}