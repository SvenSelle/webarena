/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 GeneralObject client component
*
*/

GeneralObject.getAttributeFromServer=function(attribute,respFunction){
	if (!respFunction) respFunction=function(data){
		console.log(data);
	}
	
	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;
    requestData.key=attribute;
	
	Modules.Dispatcher.query('getAttribute',requestData,respFunction);
	
}

GeneralObject.content=false;
GeneralObject.contentFetched=false;
GeneralObject.hasContent=false;
GeneralObject.normalOpacity = 1;

GeneralObject.setContent=function(content){
	this.content=content;
	this.contentFetched=true;
	
	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;
    requestData.content=content;
	
	Modules.Dispatcher.query('setContent',requestData);
	
	if (this.afterSetContent) this.afterSetContent();
	
}

GeneralObject.fetchContent=function(worker){
	
	if (!worker) worker=function(data){
		console.log(data);
	}
	
	if (this.contentFetched) {
		
		worker(this.content);
		return;
	}

	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;
	
	var that=this;
	//Do not use "this" in response fucntions as they do not refer to the object in there!
	Modules.Dispatcher.query('getContent',requestData,function(newContent){
		that.content=newContent;
		that.contentFetched=true;
		worker(newContent);
	    return;
	});
}

GeneralObject.utf8={};

GeneralObject.utf8.toByteArray = function(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; i++)
        if (str.charCodeAt(i) <= 0x7F)
            byteArray.push(str.charCodeAt(i));
        else {
            var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
            for (var j = 0; j < h.length; j++)
                byteArray.push(parseInt(h[j], 16));
        }
    return byteArray;
};

GeneralObject.utf8.parse = function(byteArray) {
    var str = '';
    for (var i = 0; i < byteArray.length; i++)
        str +=  byteArray[i] <= 0x7F?
                byteArray[i] === 0x25 ? "%25" : // %
                String.fromCharCode(byteArray[i]) :
                "%" + byteArray[i].toString(16).toUpperCase();
    try {
    	return decodeURIComponent(str);
    } catch (e) {
    }
    return '';
};

GeneralObject.fetchContentString=function(worker){
	
	this.fetchContent(function(data){

		data=GeneralObject.utf8.parse(data);

		worker(data);
		return;
	
	});

}

//ATTENTION. Do not use this, when you cannot be sure, the content has already been loaded (e.g. do not use it in draw)
GeneralObject.getContentAsString=function(){
	if (!this.contentFetched) alert('Timing error on getContentAsString. Call developer!');
	return GeneralObject.utf8.parse(this.content);
}

GeneralObject.hasContent=function(){
	return this.getAttribute('hasContent');
}

GeneralObject.contentUpdated=function(){
	
	//should be overwritten for objects that get binary content by HTTP;
	
	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;

	this.contentFetched=false;
	
	this.draw();
}


//triggered by non local change of values
GeneralObject.refresh = function() {
	if (this.moving) return;
	this.draw(true);
}


GeneralObject.getPreviewContentURL = function() {
	return "/getPreviewContent/"+this.getRoomID()+"/"+this.data.id+"/"+Math.round(new Date().getTime() / 1000)+"/"+ObjectManager.userHash;
}

GeneralObject.getContentURL = function() {
	return "/getContent/"+this.getRoomID()+"/"+this.data.id+"/"+Math.round(new Date().getTime() / 1000)+"/"+ObjectManager.userHash;
}

GeneralObject.create = function() {
	
	ObjectManager.createObject(this.type, {
		hidden: GUI.hiddenObjectsVisible
	});
	
}

GeneralObject.removeRepresentation = function() {
	
	var rep = this.getRepresentation();

	this.deselect();

	$(rep).remove();
	
}


GeneralObject.getIconPath = function() {
	return "/objectIcons/"+this.getType();
}

GeneralObject.justCreated=function(){
	//react on client side if an object has just been created and needs further input
}

GeneralObject.duplicate=function() {
	
	var requestData={};
	
	requestData.roomID=this.getRoomID();
    requestData.objectID=this.id;

	Modules.Dispatcher.query('duplicate',requestData,function(){
		
	});
	
	GUI.deselectAllObjects();
	
}

GeneralObject.getRoom=function(){
	return Modules.ObjectManager.getCurrentRoom(); //TODO this only works for single rooms
}

/**
*	determine if the current object intersects with the square x,y,width,height
*/
GeneralObject.boxIntersectsWith=function(otherx,othery,otherwidth,otherheight){
	
	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();
	
	if (otherx+otherwidth<thisx) return false;
	if (otherx>thisx+thisw) return false;
	if (othery+otherheight<thisy) return false;
	if (othery>thisy+thish) return false;
	
	return true;
	
}

/**
*	determine if the current object intersects with oanother object
*/
GeneralObject.intersectsWith=function(other){
	var otherx=other.getViewBoundingBoxX();
	var othery=other.getViewBoundingBoxY();
	var otherw=other.getViewBoundingBoxWidth();
	var otherh=other.getViewBoundingBoxHeight();
	
	return this.boxIntersectsWith(otherx,othery,otherw,otherh);
	
}

GeneralObject.hasPixelAt=function(x,y){
	
	//assume, that the GeneralObject is full of pixels.
	//override this if you can determine better, where there
	//object is nontransparent
	
	return this.boxIntersectsWith(x,y,0,0);
}

GeneralObject.boxContainsPoint=GeneralObject.hasPixelAt;
