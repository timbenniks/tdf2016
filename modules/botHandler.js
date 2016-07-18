'use strict';

var config = require( '../data/config' ),
    request = require( 'superagent' );
    
function Bot( options ){
  this.options = options;
}

Bot.prototype = {
  sendTextMessage: function( sender, text ){
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

    sendRichMessage: function( sender ){
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
    }
}

module.exports = Bot;