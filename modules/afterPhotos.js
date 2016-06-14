var call = require( './call' ),
    config = require( '../data/config.js' );

module.exports = function( state ){
  var stage = state.stage,
      photosBaseUrl = config.photosUrl,
      ext = 'jpg';

  return new Promise( ( resolve, reject )=>{
    call( `${config.baseUrl}/photos${stage}.json`, 'photos' )
      .then( ( photosData )=>{

        var photos = photosData.p.map( ( photoId )=>{
          return `${photosBaseUrl}/${stage}/${photoId}.${ext}`
        } ),
        unique = [ ...new Set( photos ) ];

        resolve( unique );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
};