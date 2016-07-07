import mapWindowGroupTmpl from '../../../views/includes/map-window-group.jade';
import mapWindowInterestTmpl from '../../../views/includes/map-window-interest.jade';

export default class PopupsHandler {
  constructor( app ){
    this.emitter = app.emitter;

    this.interestPopupHolder = document.getElementById( 'interest-popup-holder' );
    this.groupPopupHolder = document.getElementById( 'group-popup-holder' );
  }

  cleanGroups(){
    this.lastActive = this.groupPopupHolder.querySelector( '.active' );
    this.groupPopupHolder.innerHTML = '';
  }

  renderInterest( interest ){
    this.interestPopupHolder.insertAdjacentHTML( 'afterbegin', mapWindowInterestTmpl( { identifier: interest.id, interest: interest } ) );
  }

  renderGroups( groups ){
    groups.forEach( ( group )=>{
      this.groupPopupHolder.insertAdjacentHTML( 'afterbegin', mapWindowGroupTmpl( { identifier: group.identifier, group: group.content } ) );
    } );

    if( this.lastActive ){
      this.show( this.lastActive.id );
    }
  }

  show( id ){
    this.close();

    let nodeSelector = id,
        node;

    if( id.indexOf( 'climb' ) !== -1 || id.indexOf( 'sprint' ) !== -1 ){
      nodeSelector = `interest-${id.split( '-' )[ 1 ]}`;
    }

    node = document.getElementById( nodeSelector );

    if( !node ){
      return;
    }

    document.getElementById( nodeSelector ).classList.add( 'active' );
    document.getElementById( nodeSelector ).querySelector( '.close-window' ).addEventListener( 'click', this.close.bind( this ), false );
  }

  close(){
    var popups = document.querySelectorAll( '.map-window-holder' );
    for( var i = 0; i < popups.length; i++ ){
      popups[ i ].classList.remove( 'active' );
      popups[ i ].querySelector( '.close-window' ).removeEventListener( 'click', this.close.bind( this ), false );
    }
  }
}