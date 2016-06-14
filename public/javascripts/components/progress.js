import 'babel-polyfill';
import progressTmpl from '../../../views/includes/progress.jade';

export default class Stream {
  constructor( app ){
    if( !document.querySelector( '.progress' ) ){
      return false;
    }

    this.io = app.io;
    this.currentProgress = '';
    this.setHeight = 0;
    
    this.bind();

    this.groups = document.querySelector( '.groups-wrapper' );
    this.stats = document.querySelector( '.profile-stats-wrapper' );
    
    if( window.matchMedia( "(min-width: 1300px)" ).matches ){
      setTimeout( this.alignHeights.bind( this ), 100 );
    }
  }

  bind(){
    this.io.on( 'progress', ( data )=>{
      if( this.currentProgress !== JSON.stringify( data ) ){
        this.currentProgress = JSON.stringify( data );
        this.renderProgress( data ).then( this.placeProgress.bind( this ) );
      }
    } );

    window.addEventListener( 'resize', this.alignHeights.bind( this ) );
  }

  alignHeights(){
    if( window.matchMedia( "(min-width: 1300px)" ).matches ){
      if( this.setHeight === 0 ){
        this.setHeight = this.stats.offsetHeight;
      }

      document.querySelector( '.groups-wrapper' ).style.height = this.setHeight + 'px';
      document.querySelector( '.groups-wrapper' ).scrollTop = 0;
    }
    else {
      document.querySelector( '.groups-wrapper' ).style.height = 'auto'; 
    }
  }

  renderProgress( data ){
    return new Promise( ( resolve, reject )=>{
      if( !data ){
        reject( 'Did not get proper progress data' );
      }

      resolve( progressTmpl( { progress: data } ) );
    } );
  }

  placeProgress( progressHtml ){
    document.querySelector( '.progress' ).innerHTML = progressHtml;
    this.alignHeights();
  }
}