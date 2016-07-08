import GoogleMapsLoader from 'google-maps';
import {lory} from 'lory.js';
import 'babel-polyfill';

export default class MapsNews {
  constructor( mapHandler ){
    this.emitter = mapHandler.emitter;
    this.sliderNode = document.getElementById( 'news' );

    this.slider = lory( this.sliderNode, {
      infinite: false,
      classNameFrame: 'news-banner-frame',
      classNameSlideContainer: 'news-banner-slides',
      infinite: false,
      slidesToScroll: 1,
      enableMouseEvents: true
    } );

    this.emitter.on( 'newsbanner:update', this.resetSlider.bind( this ) );
  }

  resetSlider(){
    this.slider.setup();
  }
}