'use strict';

var config = require( '../data/config' ),
    express = require( 'express' ),
    beforeTour = require( './stages/beforeTour' ),
    before = require( './stages/before' ),
    during = require( './stages/during' ),
    after = require( './stages/after' ),
    getState = require( '../modules/state' ),
    getStartTime = require( '../modules/startTime' ),
    router = express.Router();

router.get( '/', ( req, res, next )=>{
  var time = new Date().getTime(),
      afterStageDate = new Date(),
      afterStageTime;  

  afterStageDate.setHours( config.dayEndsAt - config.serverTimeOffset, 0, 0, 0 );
  afterStageTime = afterStageDate.getTime();
  
  if( req.query.stage ){
    config.showBefore = false;
  }

  // Render before the tour page if the current date is before the start of the tour.
  if( config.showBefore ){
    if( new Date( config.start ).getTime() > time ){
      beforeTour( res );
      return false;
    }
  }
  
  // Render after stage view after 18:00.
  if( time > afterStageTime ){
    after( res, req.query );
  }
  else {
    getState()
      .then( getStartTime )
      .then( ( sTime )=>{
        var startDateTime = new Date();
        startDateTime.setHours( sTime.split( ':' )[ 0 ] - config.serverTimeOffset, sTime.split( ':' )[ 1 ], 0, 0 );
        
        if( time < startDateTime.getTime() ){
          before( res, req.query );
        }
        else {
          during( res, req.query );
        }
      } );
  }
} );

router.get( '/video', ( req, res, next )=>{
  res.render( 'video', { title: 'Tim\s TDF 2016' } );
} );

module.exports = router;
