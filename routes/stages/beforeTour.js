var config = require( '../../data/config' ),
    twitter = require( '../../modules/twitter' ),
    moment = require( 'moment' ),
    
    TwitterHandler = new twitter();

module.exports = function( res ){
  var tmplData = [],
      streamStarted = false,
      pubSub = res.pubSub;

  pubSub.on( 'streams:start', ()=>{
    if( !streamStarted ){
      
      TwitterHandler.createStream( 'statuses/filter', { track: 'tdf2016', filter_level: 'low', language: 'en,fr,nl' } ).then( ( stream )=>{
        stream.on( 'data', ( tweet )=>{
      
          TwitterHandler.clean( tweet ).then( ( cleanTweet )=>{
            pubSub.emit( 'socket:tweet', cleanTweet[ 0 ] );
          } )
          .catch( ( error )=>{
            pubSub.emit( 'socket:tweet:error', error );
          } );
      
        } );

        pubSub.once( 'streams:destroy', ()=>{
          stream.destroy();
        } );

      } );

      streamStarted = true;
    }
  } );

  TwitterHandler.get( 'search/tweets', { q: '#tdf2016', result_type: 'popular' } ).then( ( tweets )=>{
    tmplData.title = config.title;
    tmplData.tweets = tweets;
    tmplData.starts = moment( new Date( config.start ) ).fromNow();

    res.render( 'no_tour', tmplData );
  } );
};