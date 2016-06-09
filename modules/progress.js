var request = require( 'superagent' ),
    moment = require( 'moment' ),
    call = require( './call' ),
    riders = require( './riders' );

require( 'moment-duration-format' );

module.exports = function( state ){
  const stage = state.stage;
  const getRiderForID = ( riders, id )=>{
    var result;

    riders.forEach( ( rider )=>{
      if( rider.no === id ){
        result = rider;
      }
    } );

    return result;
  };

  return new Promise( ( resolve, reject )=>{
    riders( state )
      .then( ( riders )=>{
        call( `http://www.letour.fr/useradgents/2015/json/livestage${stage}.json`, 'progress' )
          .then( ( data )=>{
            var progress = {
              speed: ( data.s ) ? ( data.s / 1000 ).toFixed( 1 ) : 0,
              kmCompleted: ( data.kp ) ? data.kp : 0,
              kmRemaining: ( data.kr ) ? data.kr : 0,
              groups: []
            };

            if( data.g ){
              data[ 'g' ].forEach( ( group )=>{
                var mappedRiders = [];

                if( group.r ){
                  mappedRiders = group.r.map( ( rider )=>{
                    var updatedRider = getRiderForID( riders, rider.r );
                    updatedRider.behind = `+${moment.duration( rider.t, 'seconds' ).format( 'hh:mm:ss', { trim: false } )}`;

                    return updatedRider;
                  } );
                }

                progress.groups.push({
                  title: group.t,
                  runnersNo: ( group.n ) ? group.n : 0,
                  delay: ( group.d ) ? moment.duration( group.d, 'seconds' ).format( 'mm:ss', { trim: false } ) : '04:11',
                  jerseys: ( group.j ) ? group.j.split( '' ) : [],
                  riders: mappedRiders
                } );
              } );

              progress.groups = progress.groups.reverse();
            }

            progress.stage = stage;

            progress.groups.push({
              title: 'Groupe Nibali',
              runnersNo: 2,
              delay: '02:33',
              jerseys: [ 'y', 'g' ],
              riders: [{
                no: 1,
                name: "V. Nibali",
                lastName: "NIBALI",
                lang: "ita",
                behind: "+00:23",
                team: "bla"
              }, {
                no: 2,
                name: "L. Boom",
                lastName: "BOOM",
                lang: "ned",
                behind: "+01:28",
                team: "bla"
              }]
            } );

            progress.groups.push({
              title: 'Tête de la course',
              runnersNo: 1,
              delay: '',
              jerseys: [ 'w' ],
              riders: [{
                no: 1,
                name: "V. Nibali",
                lastName: "NIBALI",
                lang: "ita",
                behind: "+00:23",
                team: "bla"
              }]
            } );

            resolve( progress );
          } )
          .catch( ( error )=>{
            reject( error );
          } );
      } )
      .catch( ( error )=>{
        reject( error );
      } );
  } );
}