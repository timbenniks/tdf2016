var config = require( '../../data/config' ),
    twitter = require( '../../modules/twitter' ),
    getAppState = require( '../../modules/state' ),
    getStageInfo = require( '../../modules/stageInfo' ),
    getProgress = require( '../../modules/progress' ),
    getRank = require( '../../modules/rank' ),
    getJerseys = require( '../../modules/jerseys' ),
    getLiveNews = require( '../../modules/liveNews' ),
    streamProgress = require( '../../modules/streamProgress' ),
    streamLiveNews = require( '../../modules/streamLiveNews' ),

    beforeTour = require( './beforeTour' ),
    rest = require( './rest' ),

    TwitterHandler = new twitter();

module.exports = function( res ){
  var promises = [],
      streamStarted = false,
      pubSub = res.pubSub;

  pubSub.on( 'streams:start', ()=>{
    if( !streamStarted ){
      
      if( config.useLiveNewsInsteadOfTwitter ){
        return;
      }

      TwitterHandler.createStream( 'statuses/filter', { follow: 153403071,  with: 'user' } ).then( ( stream )=>{
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

  getAppState().then( ( state )=>{
    
    if( state.stage === '00R1' || state.stage === '00R2' ){
      rest( res );
      return false;
    }

    promises.push( TwitterHandler.get( 'statuses/user_timeline', { screen_name: 'letour', count: 10, trim_user: true, exclude_replies: true } ) )
    promises.push( getStageInfo( state ) );
    promises.push( getProgress( state ) );
    promises.push( getRank( state ) );
    promises.push( getJerseys( state, false ) );
    promises.push( getLiveNews( state ) );

    Promise.all( promises ).then( ( data )=>{
      var tmplData = {
        title: config.title,
        tweets: data[ 0 ],
        info: data[ 1 ],
        progress: data[ 2 ],
        rank: data[ 3 ],
        jerseys: data[ 4 ],
        news: data[ 5 ],
        livenews: config.useLiveNewsInsteadOfTwitter
      }

      tmplData.noprogress = ( tmplData.info.type === 'prologue' || tmplData.info.type === 'time trial' ) || !tmplData.progress.stage;

      if( !tmplData.progress.stage && !tmplData.rank.individual && !tmplData.jerseys.yellow ){
        beforeTour( res );
      }
      else {
        
        if( !tmplData.noprogress ){
          setInterval( ()=>{
            streamProgress( res.pubSub, tmplData.info );

            if( config.useLiveNewsInsteadOfTwitter ){
              streamLiveNews( res.pubSub );              
            }
          }, 20000 );
        }

        res.render( 'during', tmplData );
      }
    } )
    .catch( ( error )=>{
      res.render( 'error', { message: JSON.stringify( error ), error: error } );
    } );

  } );
};