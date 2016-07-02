"use strict";

var config = require( '../data/config' ),
    express = require( 'express' ),
    request = require( 'superagent' ),
    router = express.Router(),
    
    sendTextMessage = ( sender, text )=>{
      let messageData = { text: text };
      
      request
        .post( 'https://graph.facebook.com/v2.6/me/messages' )
        .query( { access_token: config.fb_token } )
        .send( { recipient: { id: sender }, message: messageData } )
        .end( ( err, res )=>{
          if( err ) {
            console.log( err );
          }
          else if( res.body.error ){
            console.log( res.body.error );
          }
        } );
    },

    sendRichMessage = ( sender )=>{
      let messageData = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "First card",
              "subtitle": "Element #1 of an hscroll",
              "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
              "buttons": [{
                "type": "web_url",
                "url": "https://www.messenger.com",
                "title": "web url"
              }, {
                "type": "postback",
                "title": "Postback",
                "payload": "Payload for first element in a generic bubble",
              }],
            }, {
              "title": "Second card",
              "subtitle": "Element #2 of an hscroll",
              "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
              "buttons": [{
                "type": "postback",
                "title": "Postback",
                "payload": "Payload for second element in a generic bubble",
              }],
            }]
          }
        }
      }

      request
        .post( 'https://graph.facebook.com/v2.6/me/messages' )
        .query( { access_token: config.fb_token } )
        .send( { recipient: { id: sender }, message: messageData } )
        .end( ( err, res )=>{
          if( err ) {
            console.log( err );
          }
          else if( res.body.error ){
            console.log( res.body.error );
          }
        } );
    };

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
          sendRichMessage( sender );
          continue;
        }
        
      sendTextMessage( sender, "Text received, echo: " + text.substring( 0, 200 ) );
    }

    if( event.postback ){
      let text = JSON.stringify( event.postback );
      sendTextMessage( sender, "Postback received: "+text.substring( 0, 200 ) );
      continue;
    }
  }
  
  res.sendStatus( 200 );
} );

module.exports = router;