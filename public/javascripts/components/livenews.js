import 'babel-polyfill';
import newsTmpl from '../../../views/includes/livenews-item.jade';
import newsBannerTmpl from '../../../views/includes/news-banner-item.jade';

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

        this.notifier.notify( `${data[ 0 ].time}: ${data[ 0 ].title}\n${data[ 0 ].desc.replace( /\n\n/g, '\n' )}`, 'news' );
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
    if( this.sideBarOrBanner === 'sidebar' ){
      return newsTmpl( { item: data } );
    }
    
    if( this.sideBarOrBanner === 'banner' ){
      return newsBannerTmpl( { item: data } );
    }
  } 

  placeNews( newsHtml ){
    if( this.sideBarOrBanner === 'sidebar' ){
      document.querySelector( '.stream' ).innerHTML = newsHtml;
      this.sharer.rebind();
    }
    
    if( this.sideBarOrBanner === 'banner' ){
      document.querySelector( '.news-banner-slides').innerHTML = newsHtml;
      this.emitter.emit( 'newsbanner:update' );
    }
  }
}