import 'babel-polyfill';
import newsTmpl from '../../../views/includes/livenews-item.jade';

export default class Stream {
  constructor( app, sideBarOrBanner = 'sidebar' ){
    this.emitter = app.emitter;
    this.notifier = app.notifier;
    this.sharer = app.sharer;
    this.bind();
    this.currentLiveNews = '';
    this.sideBarOrBanner = sideBarOrBanner;
  }

  bind(){
    this.emitter.on( 'socket:livenews', ( data )=>{
      if( this.currentLiveNews !== JSON.stringify( data ) ){
        this.currentLiveNews = JSON.stringify( data );

        var finalNewsHtml = '';

        data.forEach( ( item )=>{
          finalNewsHtml += this.renderNews( item );
        } );

        if( data.length > 0 ){
          this.notifier.notify( `${data[ 0 ].time}: ${data[ 0 ].title}\n${data[ 0 ].desc.replace( /\n\n/g, '\n' )}`, 'news' );
        }
        
        this.placeNews( finalNewsHtml );
      }
    } );
  }

  findNewsById( id ){
    let result;
    this.news.forEach( ( item )=>{
      if( item.id === id ){
        result = item;
      }
    } );

    return result;
  }

  findNewsInDom( id ){
    return !!document.getElementById( id );
  }

  renderNews( data ){
    return newsTmpl( { item: data } );
  } 

  placeNews( newsHtml ){
    if( this.sideBarOrBanner === 'sidebar' ){
      document.querySelector( '.stream' ).innerHTML = newsHtml;
      this.sharer.rebind();
    }
    
    if( this.sideBarOrBanner === 'map' ){
      document.querySelector( '#map-news').innerHTML = newsHtml;
      this.emitter.emit( 'newsbanner:update' );
    }
  }
}