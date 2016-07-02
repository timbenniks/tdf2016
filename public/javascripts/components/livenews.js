import 'babel-polyfill';
import newsTmpl from '../../../views/includes/livenews-item.jade';

export default class Stream {
  constructor( app ){
    this.emitter = app.emitter;
    this.notifier = app.notifier;
    this.bind();
    this.currentLiveNews = '';
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
    return newsTmpl( { item: data } );
  } 

  placeNews( newsHtml ){
    document.querySelector( '.stream' ).innerHTML = newsHtml;
  }
}