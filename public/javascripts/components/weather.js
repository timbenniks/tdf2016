import request from 'superagent';

export default class Weather {
  constructor( app ){
    this.chapeau = document.querySelector( 'header h1 .chapeau' );
    this.originalText = this.chapeau.innerText;

    request
      .get( `/weather` )
      .accept( 'application/json' )
      .end( ( err, res )=>{
        const weather = res.body;
        this.originalText += ` (${ weather.temp }° wind: ${ weather.wind })`;

        this.chapeau.innerHTML = this.originalText;
      } );
  }
}