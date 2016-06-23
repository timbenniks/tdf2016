'use strict';

var tweetParser = require( 'twitter-text' ),
    moment = require( 'moment' );


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
        id: tweet.id,
        text: tweetParser.autoLink( tweet.text, { urlEntities: tweet.entities } ),
        raw: tweet.text,
        created_at: moment( new Date( tweet.created_at ) ).format( 'MMMM Do YYYY, h:mm:ss a' ),
        entities: tweet.entities || false,
        extended_entities: tweet.extended_entities || false,
        user: tweet.user || false
      } );
    } );
  
    resolve( cleanedTweets )

  } );

}