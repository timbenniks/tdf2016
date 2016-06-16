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
    getAfterPhotos = require( '../modules/afterPhotos' ),
    getTomorrow = require( '../modules/tomorrow' ),
    TwitterHandler = new twitter(),
    router = express.Router(),

    setUpTweetStream = ( socket, query )=>{
      TwitterHandler.createStream( 'statuses/filter', query ).then( ( stream )=>{
        stream.on( 'data', ( tweet )=>{
          TwitterHandler.clean( tweet )
            .then( ( cleanTweet )=>{
              socket.emit( 'tweet', cleanTweet[ 0 ] );
            } )
            .catch( ( error )=>{
              socket.emit( 'error', error );
            } );
        } );
      } );
    },

    streamProgress = ( socket, info ) =>{
      getAppState()
        .then( getProgress )
        .then( ( data )=>{
          socket.emit( 'progress', data );
        } )
        .catch( ( error )=>{
          socket.emit( 'progress.error', error );
        } );
    },

    renderDuringStage = ( res )=>{
      let promises = [];

      getAppState().then( ( state )=>{
        
        if( state.stage === '00R1' || state.stage === '00R2' ){
          renderRestDay( res );
          return false;
        }

        promises.push( TwitterHandler.get( 'statuses/user_timeline', { screen_name: 'letour', count: 10, trim_user: true, exclude_replies: true } ) )
        promises.push( getStageInfo( state ) );
        promises.push( getProgress( state ) );
        promises.push( getRank( state ) );
        promises.push( getJerseys( state, false ) );

        Promise.all( promises ).then( ( data )=>{
          let tmplData = {
            title: config.title,
            tweets: data[ 0 ],
            info: data[ 1 ],
            progress: data[ 2 ],
            rank: data[ 3 ],
            jerseys: data[ 4 ]
          }

          tmplData.noprogress = ( tmplData.info.type === 'prologue' || tmplData.info.type === 'time trial' );

          setUpTweetStream( res.io, { follow: 153403071,  with: 'user' } );
          
          if( !tmplData.noprogress ){
            setInterval( ()=>{
              streamProgress( res.io, tmplData.info );
            }, 20000 );
          }

          res.render( 'during', tmplData );
        } )
        .catch( ( error )=>{
          res.render( 'error', { message: JSON.stringify( error ), error: error } );
        } );
      } );
    },
    
    renderAfterStage = ( res )=>{
      let promises = [];

      getAppState().then( ( state )=>{

        if( state.stage === '00R1' || state.stage === '00R2' ){
          renderRestDay( res );
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
          let tmplData = {
            title: config.title,
            info: data[ 0 ],
            rank: data[ 1 ],
            jerseys: data[ 2 ],
            afternews: data[ 3 ],
            afterrank: data[ 4 ],
            afterphotos: data[ 5 ],
            tomorrow: data[ 6 ]
          }
          console.log( tmplData.tomorrow );
          res.render( 'after', tmplData );
        } )
        .catch( ( error )=>{
          res.render( 'error', { message: JSON.stringify( error ), error: error } );
        } );
      } );
    },

    renderRestDay = ( res )=>{
      let promises = [];

      getAppState().then( ( state )=>{
        promises.push( getStageInfo( state ) );
        promises.push( TwitterHandler.get( 'search/tweets', { q: '#tdf2016', result_type: 'popular' } ) );
        promises.push( getRank( state ) );
        promises.push( getJerseys( state ) );
        promises.push( getTomorrow( state ) );

        Promise.all( promises ).then( ( data )=>{
          let tmplData = {
            title: config.title,
            info: data[ 0 ],
            tweets: data[ 1 ],
            rank: data[ 2 ],
            jerseys: data[ 3 ],
            tomorrow: data[ 4 ]
          }

          setUpTweetStream( res.io, { track: 'tdf2016', filter_level: 'none', language: 'en,fr' } );

          res.render( 'rest', tmplData );
        } )
        .catch( ( error )=>{
          res.render( 'error', { message: JSON.stringify( error ), error: error } );
        } );
      } );
    };

router.get( '/', ( req, res, next )=>{
  var time = new Date().getTime(),
      afterStageDate = new Date(),
      afterStageTime;
  
  afterStageDate.setHours( config.dayEndsAt, 0, 0, 0 );

  afterStageTime = afterStageDate.getTime();
  
  if( time > afterStageTime ){
    renderAfterStage( res );
  }
  else {
    renderDuringStage( res );
  }
} );

module.exports = router;