var call = require( './call' );

module.exports = function( state ){
  var stage = state.stage,
      photosBaseUrl = 'http://www.letour.fr/useradgents/2015/photos',
      ext = 'jpg';

  return new Promise( ( resolve, reject )=>{
    call( `http://www.letour.fr/useradgents/2015/json/photos${stage}.json`, 'photos' )
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