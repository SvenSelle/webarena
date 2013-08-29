/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js')
var ActivatorHotspot=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

ActivatorHotspot.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	this.makeReacting();
	
	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

ActivatorHotspot.isCreatable=true; 
ActivatorHotspot.category = 'Active';


module.exports=ActivatorHotspot;