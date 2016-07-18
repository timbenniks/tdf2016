"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    request = require( 'superagent' ),
    BotHandler = require( '../modules/botHandler' ),
    router = express.Router(),
    botHandler = new BotHandler();

router.get( '/', ( req, res )=>{
  if( req.query[ 'hub.verify_token' ] === 'my_voice_is_my_password_verify_me' ){
    res.send( req.query[ 'hub.challenge' ] );
  }
    
  res.render( 'error', {
    message: 'Wrong token',
    error: {}
  });
} );

router.post( '/', ( req, res )=>{
  let messaging_events = req.body.entry[ 0 ].messaging;
  
  for( let i = 0; i < messaging_events.length; i++ ){
    let event = req.body.entry[ 0 ].messaging[ i ];
    let sender = event.sender.id;
    
    if( event.message && event.message.text ){
      let text = event.message.text;
        if( text === 'awesome' ){
          botHandler.sendRichMessage( sender );
          continue;
        }
        
      botHandler.sendTextMessage( sender, "Text received, echo: " + text.substring( 0, 200 ) );
    }

    if( event.postback ){
      let text = JSON.stringify( event.postback );
      botHandler.sendTextMessage( sender, "Postback received: "+text.substring( 0, 200 ) );
      continue;
    }
  }
  
  res.sendStatus( 200 );
} );

module.exports = router;