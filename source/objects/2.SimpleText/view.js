/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

SimpleText.draw=function(external){
	
	var rep=this.getRepresentation();
	
	this.drawDimensions(external);

	//$(rep).attr("fill", this.getAttribute('fillcolor'));
	
	if (!$(rep).hasClass("selected")) {
		$(rep).find("text").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("text").attr("stroke-width", this.getAttribute('linesize'));
	}
	
	$(rep).find("text").attr("font-size", this.getAttribute('font-size'));
	$(rep).find("text").attr("font-family", this.getAttribute('font-family'));
	$(rep).find("text").attr("fill", this.getAttribute('font-color'));
	
	$(rep).attr("layer", this.getAttribute('layer'));


	var that=this;
	
	this.fetchContentString(function(data){
		
		if(data!=that.oldContent){
			$(rep).find("text").get(0).textContent=data;
			if (!data) $(rep).find("text").get(0).textContent='No text yet!';
		}
		
		that.oldContent=data;
		
		$(rep).find("text").attr("y", rep.getBBox().y*(-1));
		
	});
	
}



SimpleText.createRepresentation = function() {
	
	var rep = GUI.svg.group(this.getAttribute('id'));
	
	GUI.svg.text(rep, 0, 0, "Text");

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}




SimpleText.editText = function() {
	
	GUI.editText(this);
	
}




/* get the y position of the objects bounding box (this is the top position of the object) */
SimpleText.getViewBoundingBoxY = function() {
	var rep = this.getRepresentation();
	return this.getRepresentation().getBBox().y-this.getRepresentation().getBBox().height*0.66
}

/* get the height of the objects bounding box */
SimpleText.getViewBoundingBoxHeight = function() {
	var rep = this.getRepresentation();
	return this.getRepresentation().getBBox().height*0.66;
}