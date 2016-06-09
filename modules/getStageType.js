module.exports = function( id ){
  var type;

  switch( id ){
    case 'PAS': type = 'prologue'; break;
    case 'EQU': type = 'time trial'; break;
    case 'REP': type = 'rest day'; break;

    case 'LGN':
    case 'HMG':
    case 'MMG': type = 'regular race'; break;

    default:
      type = 'regular';
  }

  return type;
};