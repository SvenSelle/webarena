"use strict";

/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


/**
*	Each object type get its attribute manager. Attributes must be registred
*   in the attribute manager before they can be set or got. This is necessary
*   for GUIs to implement an object inspector as well as for channelling data
*   access to the server.
*
*   Note: There is no data stored in the attribute manager. These data, which
*   is unique for every single object, is saved in the data member of the
*   respective object
*/
var AttributeManager=Object.create(Object);

AttributeManager.proto=false;
AttributeManager.attributes=false;

AttributeManager.init=function(proto){
	
	// The attribute manager is initialized during the registration of object
	// types so we create the datastructure for the prototype
	
	this.proto=proto;
	this.attributes={};
	
}

AttributeManager.toString=function(){
	return 'AttributeManager for '+this.proto;
}

/**
*	register an attribute for a prototype
*
*	data: 	type - 'text','number','color',...
*			unit - '%','°',...
*			min - integer
*			max - integer
*			standard
*			setFunction - function
*			getFunction - function
*			readonly - true, false
*			hidden - true, false
*			category - a block or tab this attribute should be displayed in
*
*
*/
AttributeManager.registerAttribute=function(attribute,data){
	
	if (!attribute) return;
	var manager=this;
	

	// fill in old properties, if the attribute has yet been registred.
	var oldData=this.attributes[attribute] || {};
	
	//if (oldData) console.log('Attribute '+attribute+' for '+this.proto+' type '+data.type+' has already been specified.');
	
	for (var key in oldData){
		var oldValue=oldData[key];
		if (data[key]===undefined) data[key]=oldValue;
	}

	
	//debug('Registering attribute '+attribute+' for '+this.proto+' type '+data.type);
	
	if (data.type===undefined) data.type='text';
	if (data.description==undefined && data.readable==undefined) data.description=attribute;
	if (data.readable!==undefined) data.description=data.readable;
	if (data.unit===undefined) data.unit='';
	if (data.min===undefined) data.min=-50000;
	if (data.max===undefined) data.max=50000;
	if (data.standard==undefined) data.standard=0;
	if (data.category==undefined) data.category='Basic';
	
	data.setter=function(object,value){
		
		if (value===undefined) value=data.standard;
		if (data.type=='number' || data.type=='fontsize'){
			value=parseInt(value,10);
			if (isNaN(value)) value=data.standard;
			if (value<data.min) value=data.min;
			if (value>data.max) value=data.max;
		}
		if (data.setFunction) {
			data.setFunction(object,value);
		}
		else {
			object.data[attribute]=value;
		}
	}

	data.getter=function(object){
		if (!data.getFunction) {
			var result=object.data[attribute];
		} else {
			var result=data.getFunction(object);
		}
		if (result===undefined) {
			result=data.standard;
		}

		if (data.type=='number' && attribute!='id'){
			result=parseInt(result,10);
			if (isNaN(result)) result=data.standard;
			if (result<data.min) {
				result=data.min;
			}
			
			if (result>data.max) {
				result=data.max;
			}
		
		}
			
		
		return result;
	}
	
	this.attributes[attribute]=data;
	
	return data;

}

var saveDelays={};

/**
*	set an attribute to a value on a specified object
*/
AttributeManager.setAttribute=function(object,attribute,value,forced,noevaluation){
	if (attribute=='position'){
		AttributeManager.setAttribute(object,'x',value.x,forced);
		AttributeManager.setAttribute(object,'y',value.y,forced);
		return true;
	} 	
	
	if (object.ObjectManager.isServer && !noevaluation){	
		
		if (attribute=='x' || attribute=='y' || attribute=='width' || attribute=='height'){
			object.evaluatePosition(attribute,value,object.getAttribute(attribute));
		}
	}	
	
	// do nothing, if value has not changed
	if (object.data[attribute]===value) return false;
	
	// get the object's setter function. If the attribute is not registred,
	// create a setter function which directly sets the attribute to the
	// specified value
	var setter=(this.attributes[attribute])?this.attributes[attribute].setter:function(object,value){object.data[attribute]=value;};
	
	// check if the attribute is read only
	if (this.attributes[attribute] && this.attributes[attribute].readonly) {
		console.log('Attribute '+attribute+' is read only for '+this.proto);
		return undefined;
	}
	
	// call the setter function
	
	setter(object,value);
	
	// persist the results
	
	if (object.ObjectManager.isServer){
		object.persist();
	} else {

		var identifier=object.id+'#'+attribute;
		
		if (saveDelays[identifier]){
			window.clearTimeout(saveDelays[identifier]);
			delete(saveDelays[identifier]);
		}
		
		
		var data={'roomID':object.data.inRoom, 'objectID':object.id, 'key':attribute, 'value':value};
		
		//this timer is the delay in which changes on the same object are discarded
		var theTimer=200;
		
		if (forced) {
			Modules.SocketClient.serverCall('setAttribute',data);
		} else {
			saveDelays[identifier]=window.setTimeout(function(){
				Modules.SocketClient.serverCall('setAttribute',data);
			},theTimer);
		}
		
	}
	
	if (object.ObjectManager.attributeChanged) object.ObjectManager.attributeChanged(object,attribute,this.getAttribute(object, attribute),true);
	
	return true;
}

/**
*	get an attribute of a specified object
*/
AttributeManager.getAttribute=function(object,attribute,noevaluation){
	
	//on unregistred attributes directly return their value
	if (this.attributes[attribute]==undefined){
		return object.data[attribute];
	}
	
	var getter=this.attributes[attribute].getter;
	
	// call the getter function
	
	return getter(object);
}

/**
*	get a full attribute set of an object
*	with getter functions and evaluations
*/
AttributeManager.getAttributeSet=function(object){
	
	var result={};
	
	for (var key in object.data){
		result[key]=AttributeManager.getAttribute(object,key);
	}
	
	return result;
}


AttributeManager.hasAttribute=function(object,attribute) {
	return (this.attributes[attribute]!=undefined);
}

/**
*	get the attributes (e.g. for GUI)
*
*	returns only registred attribute data, not their contents or unregistred attributes
*/
AttributeManager.getAttributes=function(){
	return this.attributes;
}

module.exports=AttributeManager;