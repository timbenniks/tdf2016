var call = require( './call' );

module.exports = function( state ){
  var stage = state.stage;

  return new Promise( ( resolve, reject )=>{
    call( `http://www.letour.fr/useradgents/2015/json/afternews${stage}_en.json`, 'after news' )
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