var call = require( './call' ),
    moment = require( 'moment' ),
    config = require( '../data/config.js' );

require( 'moment-duration-format' );

module.exports = function(){
  return new Promise( ( resolve, reject )=>{
    
    call( `${config.baseUrl}/appState.json`, 'state' )
      .then( ( state )=>{

        var jerseys = [];

        if( state.j.y ){
          jerseys.push( {
            kind: 'yellow',
            name: state.j.y[ 0 ],
            team: state.j.y[ 1 ],
            meta: moment.duration( state.j.y[ 2 ], 'seconds' ).format( 'hh:mm:ss', { trim: false } )
          } );
        }

        if( state.j.w ){
          jerseys.push( {
            kind: 'white',
            name: state.j.w[ 0 ],
            team: state.j.w[ 1 ],
            meta: moment.duration( state.j.w[ 2 ], 'seconds' ).format( 'hh:mm:ss', { trim: false } )
          } );
        }

        if( state.j.d ){
          jerseys.push( {
            kind: 'polka_dots',
            name: state.j.d[ 0 ],
            team: state.j.d[ 1 ],
            meta: `${state.j.d[ 2 ]} points`
          } );
        }

        if( state.j.g ){
          jerseys.push( {
            kind: 'green',
            name: state.j.g[ 0 ],
            team: state.j.g[ 1 ],
            meta: `${state.j.g[ 2 ]} points`
          } );
        }
        
        resolve( {
          stage: ( config.debugStage ) ? config.debugStage : state.stage,
          route: state.jsonVersions.route,
          starters: ( state.jsonVersions.starters ) ? state.jsonVersions.starters : false,
          jerseys: jerseys,
          checkpoints: state.jsonVersions.checkpoints,
          cities: state.jsonVersions.cities_en
        } );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
}