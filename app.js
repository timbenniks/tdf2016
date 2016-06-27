"use strict";

var http = require( 'http' ),
    express = require( 'express' ),
    path = require( 'path' ),
    favicon = require( 'serve-favicon' ),
    logger = require( 'morgan' ),
    cookieParser = require( 'cookie-parser' ),
    bodyParser = require( 'body-parser' ),
    socketio = require( 'socket.io' ),
    stylus = require( 'stylus' ),
    nib = require( 'nib' ),
    browserify = require( 'browserify-middleware' ),
    babelify = require( 'babelify' ),
    jadeify = require( 'jadeify' ),
    home = require( './routes/index' ),
    api = require( './routes/api' ),
    EventEmitter = require( 'events' ).EventEmitter;

const app = express();
const server = http.Server( app );
const io = socketio( server );
const pubSub = new EventEmitter();
let connectedUsers = [];

// view engine setup
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'jade' );

app.use( ( req, res, next )=>{
  res.pubSub = pubSub;
  next();
});

// uncomment after placing your favicon in /public
app.use( favicon( path.join( __dirname, 'public', 'favicon.ico' ) ) );
app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: false }) );
app.use( cookieParser() );

// css
app.use( stylus.middleware( {
  src: path.join( __dirname, 'public' ),
  compile: (str, path)=>{
    return stylus( str )
      .set( 'filename', path )
      .set( 'compress', false )
      .use( nib() )
      .import( 'nib' );
  }
} ) );

// js
browserify.settings({
  transform: [ 
    [ 'babelify', { 'presets': ['es2015'] } ], 
    [ 'jadeify', { 'compileDebug': false, 'pretty': true } ] 
  ]
});

app.use('/app.js', browserify( path.join( __dirname, '/public/javascripts/app.js' ) ) );

// public files
app.use( express.static( path.join( __dirname, 'public' ) ) );

// routes
app.use( '/', home );
app.use( '/api/', api );

io.sockets.on( 'connection', ( socket )=>{
  
  if( connectedUsers.indexOf( socket.id ) === -1){
    connectedUsers.push( socket.id );
  }

  socket.on( 'disconnect', ()=>{
    var index = connectedUsers.indexOf( socket.id );
    if( index !== -1 ){
      connectedUsers.splice( index, 1 );
    }

    if( connectedUsers.length === 0 ){
      pubSub.emit( 'streams:destroy' );
    }
  } );

  socket.on( 'start-stream', ()=>{

    if( connectedUsers.length > 0 ){
      pubSub.emit( 'streams:start' );
    }

    pubSub.on( 'socket:tweet', ( data )=>{
      if( connectedUsers.length > 0 ){
        socket.broadcast.emit( 'tweet', data );
        socket.emit.emit( 'tweet', data );
      }
      else {
        pubSub.emit( 'streams:destroy' );
      }
    } );

    pubSub.on( 'socket:livenews', ( data )=>{
      if( connectedUsers.length > 0 ){
        socket.broadcast.emit( 'livenews', data );
        socket.emit.emit( 'livenews', data );
      }
      else {
        pubSub.emit( 'streams:destroy' );
      }
    } );

    pubSub.on( 'socket:progress', ( data )=>{
      if( connectedUsers.length > 0 ){
        socket.broadcast.emit( 'progress', data );
        socket.emit.emit( 'progress', data );
      }
      else {
        pubSub.emit( 'streams:destroy' );
      }
    } );

  } );

  socket.emit( 'connected', { id: socket.id } );
} );

// catch 404 and forward to error handler
app.use( ( req, res, next )=>{
  var err = new Error( 'Not Found' );
  err.status = 404;
  next( err );
});

// error handlers

// development error handler
// will print stacktrace
if( app.get( 'env' ) === 'development' ){
  app.use( ( err, req, res, next )=>{
    res.status( err.status || 500 );
    res.render( 'error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use( ( err, req, res, next )=>{
  res.status( err.status || 500 );
  res.render( 'error', {
    message: err.message,
    error: {}
  });
});

module.exports = { 
  app: app, 
  server: server 
};