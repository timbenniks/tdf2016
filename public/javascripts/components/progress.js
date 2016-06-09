import 'babel-polyfill';
import progressTmpl from '../../../views/includes/progress.jade';

export default class Stream {
  constructor( app ){
    this.io = app.io;
    this.currentProgress = '';
    this.bind();
    
    this.groups = document.querySelector( '.groups-wrapper' );
    this.stats = document.querySelector( '.profile-stats-wrapper' );
    
    if( window.matchMedia( "(min-width: 1300px)" ).matches ){
      this.groups.style.height = '0px';
      setTimeout( this.alignHeights.bind( this ), 2000 );
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
      this.groups.style.height = this.stats.offsetHeight + 'px';
      this.groups.scrollTop = 0;
    }
    else {
      this.groups.style.height = 'auto'; 
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
  }
}