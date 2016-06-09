'use strict';

var tweetParser = require( 'twitter-text' );
var moment = require( 'moment' );

module.exports = ( tweets )=>{

  return new Promise( ( resolve, reject )=>{
    if( !tweets ){
      reject( 'No tweet given for cleaning' );
    }

    if( !tweets.length ){
      tweets = new Array( tweets );
    }

    let cleanedTweets = [];

    tweets.forEach( ( tweet )=>{
      cleanedTweets.push({
        text: tweetParser.autoLink( tweet.text, { urlEntities: tweet.entities } ),
        created_at: moment( new Date( tweet.created_at ) ).format( 'MMMM Do YYYY, h:mm:ss a' ),
        entities: tweet.entities || false
      } );
    } );
  
    resolve( cleanedTweets )

  } );

}