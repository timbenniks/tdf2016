'use strict';

var config = require( '../data/config' ),
    express = require( 'express' ),
    beforeTour = require( './stages/beforeTour' ),
    during = require( './stages/during' ),
    after = require( './stages/after' ),
    router = express.Router();

router.get( '/', ( req, res, next )=>{
  var time = new Date().getTime(),
      afterStageDate = new Date(),
      afterStageTime;  

  afterStageDate.setHours( config.dayEndsAt, 0, 0, 0 );
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
    during( res, req.query );
  }
} );

module.exports = router;