"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    twitter = require( '../modules/twitter' ),
    getAppState = require( '../modules/state' ),
    getStageInfo = require( '../modules/stageInfo' ),
    getProgress = require( '../modules/progress' ),
    getRank = require( '../modules/rank' ),
    getJerseys = require( '../modules/jerseys' ),
    getAfterNews = require( '../modules/afterNews' ),
    getAfterRank = require( '../modules/afterRank' ),
    getLiveNews = require( '../modules/liveNews' ),
    getAfterPhotos = require( '../modules/afterPhotos' ),
    getTomorrow = require( '../modules/tomorrow' ),
    TwitterHandler = new twitter(),
    router = express.Router(),

    during = ( res, params )=>{
      var promises = [];

      if( params.stream && params.stream === 'twitter' ){
        config.useLiveNewsInsteadOfTwitter = false;
      }
      else if( params.stream && params.stream === 'livenews' ){
        config.useLiveNewsInsteadOfTwitter = true;
      }

      if( params.twitter_id ){
        config.twitterAccountToFollow = params.twitter_id;
      }

      getAppState().then( ( state )=>{
        
        if( params.stage ){
          state.stage = params.stage;
        }

        if( state.stage === '00R1' || state.stage === '00R2' ){
          rest( res, params );
          return false;
        }

        promises.push( TwitterHandler.get( 'statuses/user_timeline', { user_id: config.twitterAccountToFollow, count: 10, trim_user: true, exclude_replies: true } ) )
        promises.push( getStageInfo( state ) );
        promises.push( getProgress( state ) );
        promises.push( getRank( state ) );
        promises.push( getJerseys( state, false ) );
        promises.push( getLiveNews( state ) );

        Promise.all( promises ).then( ( data )=>{
          var apiData = {
            title: config.title,
            tweets: data[ 0 ],
            info: data[ 1 ],
            progress: data[ 2 ],
            rank: data[ 3 ],
            jerseys: data[ 4 ],
            news: data[ 5 ],
            livenews: config.useLiveNewsInsteadOfTwitter
          }

          apiData.noprogress = ( apiData.info.type === 'prologue' || apiData.info.type === 'time trial' ) || !apiData.progress.stage;

          if( !apiData.progress.stage && !apiData.rank.individual && !apiData.jerseys.yellow ){
            res.json( { error: 'not enough data' } );
          }
          else {
            apiData.status = 'during';
            res.json( apiData );
          }
        } )
        .catch( ( error )=>{ res.json( error ) } );
      } );
    },
    
    after = ( res, params )=>{
      let promises = [];

      getAppState().then( ( state )=>{

        if( params.stage ){
          state.stage = params.stage;
        }

        if( state.stage === '00R1' || state.stage === '00R2' ){
          rest( res, params );
          return false;
        }

        promises.push( getStageInfo( state ) );
        promises.push( getRank( state ) );
        promises.push( getJerseys( state, true ) );
        promises.push( getAfterNews( state ) );
        promises.push( getAfterRank( state ) );
        promises.push( getAfterPhotos( state ) );
        promises.push( getTomorrow( state ) );
        
        Promise.all( promises ).then( ( data )=>{
          let apiData = {
            title: config.title,
            info: data[ 0 ],
            rank: data[ 1 ],
            jerseys: data[ 2 ],
            afternews: data[ 3 ],
            afterrank: data[ 4 ],
            afterphotos: data[ 5 ],
            tomorrow: data[ 6 ]
          }

          apiData.status = 'after';
          res.json( apiData );
        } )
        .catch( ( error )=>{ res.json( error ) } );
      } );
    },

    rest = ( res, params )=>{
      let promises = [];

      getAppState().then( ( state )=>{
        promises.push( getStageInfo( state ) );
        promises.push( TwitterHandler.get( 'search/tweets', { q: '#tdf2016', result_type: 'popular' } ) );
        promises.push( getRank( state ) );
        promises.push( getJerseys( state ) );

        Promise.all( promises ).then( ( data )=>{
          let apiData = {
            title: config.title,
            info: data[ 0 ],
            tweets: data[ 1 ],
            rank: data[ 2 ],
            jerseys: data[ 3 ]
          }
          
          apiData.status = 'rest';
          res.json( apiData );
        } )
        .catch( ( error )=>{ res.json( error ) } );
      } );
    };

router.get( '/', ( req, res, next )=>{
  res.json( { error: 'What is the magic word?' } );
} );

router.get( '/all', ( req, res, next )=>{
  var time = new Date().getTime(),
      afterStageDate = new Date(),
      afterStageTime;  

  afterStageDate.setHours( config.dayEndsAt, 0, 0, 0 );
  afterStageTime = afterStageDate.getTime();
  
  // Render after stage view after 18:00.
  if( time > afterStageTime ){
    after( res, req.query );
  }
  else {
    during( res, req.query );
  }
} );

router.get( '/progress', ( req, res, next )=>{
  var time = new Date().getTime(),
      afterStageDate = new Date(),
      afterStageTime;
  
  afterStageDate.setHours( config.dayEndsAt, 0, 0, 0 );
  afterStageTime = afterStageDate.getTime();

  if( time > afterStageTime ){
    res.json( { error: 'No progress' } );
    return false;
  }
    
  getAppState().then( ( state )=>{
    var promises = [];
      
    if( req.query.stage ){
      state.stage = req.query.stage;
    }

    promises.push( TwitterHandler.get( 'statuses/user_timeline', { user_id: config.twitterAccountToFollow, count: 10, trim_user: true, exclude_replies: true } ) );
    promises.push( getProgress( state ) );
    promises.push( getLiveNews( state ) );

    Promise.all( promises ).then( ( data )=>{
      let apiData = {
        tweets: data[ 0 ],
        progress: data[ 1 ],
        news: data[ 2 ],
        livenews: config.useLiveNewsInsteadOfTwitter
      }

      res.json( apiData );
    } )
    .catch( ( error )=>{ res.json( error ) } );
  } );
} );

module.exports = router;