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
    TwitterHandler = new twitter(),
    router = express.Router(),

    setUpTweetStream = ( socket )=>{
      TwitterHandler.createStream( 'statuses/filter', { follow: 153403071,  with: 'user' } ).then( ( stream )=>{
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
        promises.push( TwitterHandler.get( 'statuses/user_timeline', { screen_name: 'letour', count: 10, trim_user: true, exclude_replies: true } ) )
        promises.push( getStageInfo( state ) );
        promises.push( getProgress( state ) );
        promises.push( getRank( state ) );
        promises.push( getJerseys( state, false ) );
        
        Promise.all( promises ).then( ( data )=>{
          let tweets = data[ 0 ],
              info = data[ 1 ],
              progress = data[ 2 ],
              rank = data[ 3 ],
              jerseys = data[ 4 ];
        
          setUpTweetStream( res.io );
          
          setInterval( ()=>{
            streamProgress( res.io, info );
          }, 20000 );

          res.render( 'during', { title: 'Tim\'s TDF2016', tweets: tweets, info: info, progress: progress, rank: rank, jerseys: jerseys } );
        } )
        .catch( ( error )=>{
          res.render( 'error', { message: JSON.stringify( error ), error: error } );
        } );
      } );
    },
    
    renderAfterStage = ( res )=>{
      let promises = [];

      getAppState().then( ( state )=>{
        promises.push( TwitterHandler.get( 'statuses/user_timeline', { screen_name: 'letour', count: 10, trim_user: true, exclude_replies: true } ) )
        promises.push( getStageInfo( state ) );
        promises.push( getRank( state ) );
        promises.push( getJerseys( state, true ) );
        promises.push( getAfterNews( state ) );
        promises.push( getAfterRank( state ) );
        
        Promise.all( promises ).then( ( data )=>{
          let tweets = data[ 0 ],
              info = data[ 1 ],
              rank = data[ 2 ],
              jerseys = data[ 3 ],
              afterNews = data[ 4 ],
              afterRank = data[ 5 ];

          setUpTweetStream( res.io );

          res.render( 'after', {
            title: 'Tim\'s TDF2016', tweets: tweets, info: info, rank: rank, jerseys: jerseys, afternews: afterNews, afterrank: afterRank } );
        } )
        .catch( ( error )=>{
          res.render( 'error', { message: JSON.stringify( error ), error: error } );
        } );
      } );
    };


router.get( '/', ( req, res, next )=>{
  //renderAfterStage( res );
  renderDuringStage( res );
} );

module.exports = router;