"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    twitter = require( '../modules/twitter' ),
    getAppState = require( '../modules/state' ),
    getStageInfo = require( '../modules/stageInfo' ),
    getProgress = require( '../modules/progress' ),
    getRank = require( '../modules/rank' ),
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
    };


router.get( '/', ( req, res, next )=>{
  
  let twQuery = 'statuses/user_timeline',
      twOpts = { screen_name: 'letour', count: 10, trim_user: true, exclude_replies: true },
      promises = [];

  getAppState().then( ( state )=>{
    promises.push( TwitterHandler.get( twQuery, twOpts ) )
    promises.push( getStageInfo( state ) );
    promises.push( getProgress( state ) );
    promises.push( getRank( state ) );
    
    Promise.all( promises ).then( ( data )=>{
      let tweets = data[ 0 ],
          info = data[ 1 ],
          progress = data[ 2 ],
          rank = data[ 3 ];

      //setUpTweetStream( res.io );
      
      // setInterval( ()=>{
      //   streamProgress( res.io, info );
      // }, 20000 );

      //{ polka_dots: [ 'Froome', 'SKY', 119 ],green: [ 'Sagan', 'TCS', 432 ],white: [ 'Quintana Rojas', 'MOV', 305246 ],yellow: [ 'Froome', 'SKY', 305174 ] }

      res.render( 'index', { title: 'Tim\'s TDF2016', tweets: tweets, info: info, progress: progress, rank: rank, jerseys: state.jerseys } );
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: error, error: {} } );
    } );
  } );

} );

module.exports = router;