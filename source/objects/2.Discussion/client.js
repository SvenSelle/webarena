Discussion.formatTimestamp = function(time){
    return moment(time).format('DD.MM.YYYY HH:mm');
}

Discussion.deleteStatement = function(timestamp){
    var newArr = new Array();
    for (var i = 0, j = this.messageArray.length; i < j; ++i){
        if(this.messageArray[i].timestamp !== timestamp){
            newArr.push(this.messageArray[i])
        }
    }
    this.setContent(JSON.stringify(newArr));
}

Discussion.fetchDiscussion = function(rep, callback){
    if(!rep)rep = this.getRepresentation();
    var that = this;

    var remoteContent = this.getContentAsString();

    if(remoteContent !== ""){
        remoteContent = JSON.parse(remoteContent);
    }


    that.messageArray = remoteContent;

    // update content
    if (that.oldContent !== remoteContent) {   //content has changed

        var text = '';
        var messageArray = remoteContent;

        for (var i = 0; i < messageArray.length; ++i){
            text += that.renderMessage(messageArray[i]);
        }
        text = text.replace(/[\r\n]+/g, "<br />");
        $(rep).find(".discussion-text").html(text);

        that.oldContent=messageArray;
    }

    that.enableInlineEditors();

    if(callback) callback();
}


Discussion.contentUpdated = function(){
    var that = this;
    this.fetchContent(function(){
        that.fetchDiscussion();
    }, true);

}