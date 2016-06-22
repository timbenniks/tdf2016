import 'babel-polyfill';
import newsTmpl from '../../../views/includes/livenews-item.jade';

export default class Stream {
  constructor( app ){
    this.io = app.io;
    this.bind();
    this.currentLiveNews = '';
  }

  bind(){
    this.io.on( 'livenews', ( data )=>{
      if( this.currentLiveNews !== JSON.stringify( data ) ){
        this.currentLiveNews = JSON.stringify( data );

        var finalNewsHtml = '';

        data.forEach( ( item )=>{
          finalNewsHtml += this.renderNews( item );
        } );

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