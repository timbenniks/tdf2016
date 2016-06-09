'use strict';

var twitterClient = require( 'twitter' ),
    config = require( '../data/config' ),
    tweetCleaner = require( './tweetCleaner' ),
    client = new twitterClient( config.twitter ),
    mock = [];

function Twitter( options ){
  if( !( this instanceof Twitter ) ) { 
    return new Twitter( options )
  }
}

Twitter.prototype = {
  createStream: function( query, options ){
    return new Promise( ( resolve, reject )=>{
      if( !query ){
        reject( 'No stream query given' );
      }

      options = options || {};

      client.stream( query, options, function( stream ){
        stream.on( 'error', function( error ){
          reject( error );
        } );

        resolve( stream );
      } );

    } );
  },

  get: function( query, options ){
    return new Promise( ( resolve, reject )=>{
      // tweetCleaner( mock )
      //   .then( resolve )
      //   .catch( reject );

      client.get( query, options, function( error, tweets, response ){
        if( error ){
          reject( error );
        }

        tweetCleaner( tweets )
          .then( resolve )
          .catch( reject );
      } );
    } );
  },

  clean: function( tweets ){
    return tweetCleaner( tweets );
  }
}

module.exports = Twitter;
