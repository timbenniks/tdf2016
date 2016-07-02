"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    router = express.Router();

router.get( '/', ( req, res )=>{
  if( req.query[ 'hub.verify_token' ] === 'my_voice_is_my_password_verify_me' ){
    res.send( req.query[ 'hub.challenge' ] );
  }
    
  res.render( 'error', {
    message: 'Wrong token',
    error: {}
  });
} );

// router.post( '/', ( req, res )=>{
//   res.json( { error: 'What is the magic word?' } );
// } );


module.exports = router;