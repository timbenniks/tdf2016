'use strict';

var cheerio = require( 'cheerio' );

module.exports = ( html )=>{
  
  return new Promise( ( resolve, reject )=>{
    var $ = cheerio.load( html ),
        result = [],
        metaTags = $( 'meta[name^="twitter:"]' );
  
    if( metaTags.length === 0 ){
      reject( 'No meta tags' );
    }

    metaTags.each( ( i, element )=>{
      result.push( {
        name: element.attribs.name.replace( 'twitter:', '' ),
        content: element.attribs.content
      } )
    });

    resolve( result );
  } );
}