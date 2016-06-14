var call = require( './call' ),
    config = require( '../data/config.js' );

module.exports = function( state ){
  var stage = state.stage;

  return new Promise( ( resolve, reject )=>{
    call( `${config.baseUrl}/afternews${stage}_en.json`, 'after news' )
      .then( ( afterNews )=>{
        var news = afterNews.f,
            interviews = afterNews.i,
            data = {};

        if( !news || !interviews ){
          reject( 'No after data yet' );
        }

        data.news = news.map( ( newsItem )=>{
          return {
            title: newsItem.t,
            short: newsItem.c,
            long: newsItem.b,
          }
        } );

        data.interviews = interviews.map( ( interviewItem )=>{
          return {
            title: interviewItem.t,
            extra: ( interviewItem.c ) ? interviewItem.c : "",
            body: interviewItem.b
          }
        } );

        resolve( data );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};