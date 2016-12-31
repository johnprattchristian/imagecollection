// Retrieve a setting object by 'item' property (the name) from the _settings arrays for use
var getTipFromArray = function(tip){
	// retrieve the first item from an array of settings that match the given name
	return $.grep(helpTips,function(e){return e.item === tip})[0];
};

$(function(){
	
});