import groupTmpl from '../../../views/includes/map-group.jade';
import 'babel-polyfill';

export default class MapsGroups {
  constructor( mapHandler ){
    this.emitter = mapHandler.emitter;
    this.toggler = document.querySelector( '.map-show-groups' );
    this.groupsWrapper = document.getElementById( 'groups-sidebar-holder' );
    this.bind();
    this.emitter.on( 'panels:rebind', this.rebind.bind( this ) );
  }

  bind(){
    this.toggler.addEventListener( 'click', this.onTogglerClick.bind( this ) );
  }

  rebind(){
    this.toggler = document.querySelector( '.map-show-groups' );
    this.toggler.removeEventListener( 'click', this.onTogglerClick.bind( this ) );
    this.bind();
  }

  onTogglerClick(){
    this.emitter.emit( 'panels:toggle' );
    this.groupsWrapper.classList.add( 'active' );
  }

  deActivate(){
    this.groupsWrapper.classList.remove( 'active' );
  }

  cleanGroups(){
    this.groupsWrapper.innerHTML = '';
  }

  renderGroups( groups ){
    var finalGroupHtml = '';

    groups.forEach( ( group )=>{
      finalGroupHtml += groupTmpl( { identifier: `sidebar-${group.identifier}`, group: group.content } );
    } );

    this.groupsWrapper.innerHTML = finalGroupHtml;
  }
}