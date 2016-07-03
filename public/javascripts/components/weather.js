import request from 'superagent';

export default class Weather {
  constructor( app ){
    this.chapeau = document.querySelector( 'header h1 .chapeau' );
    this.content = this.chapeau.innerText;

    request
      .get( `/weather` )
      .accept( 'application/json' )
      .end( ( err, res )=>{
        const weather = res.body;
        this.content += ` (${ weather.temp }°, wind: ${ weather.wind }, humidity: ${ weather.humidity }%)`;
        this.chapeau.innerHTML = this.content;
      } );
  }
}