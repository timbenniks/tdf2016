var config = require( '../../data/config' ),
    twitter = require( '../../modules/twitter' ),
    setupTweetStream = require( '../../modules/setupTweetStream' ),
    moment = require( 'moment' ),

    TwitterHandler = new twitter();

module.exports = function( res ){
  var tmplData = [];
  TwitterHandler.get( 'search/tweets', { q: '#tdf2016', result_type: 'popular' } ).then( ( tweets )=>{
    tmplData.title = config.title;
    tmplData.tweets = tweets;
    tmplData.starts = moment( new Date( config.start ) ).fromNow();

    setupTweetStream( res.io, { track: 'tdf2016', filter_level: 'none', language: 'en,fr,nl' } );
  
    res.render( 'no_tour', tmplData );
  
  } );
};