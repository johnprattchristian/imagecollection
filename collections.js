// CHANGE the current collection
var changeCollection=function(new_index){
	dbIndex = new_index;
	imageDB = DATABASE[dbIndex];
	$("#collectionFooter").text(collections[dbIndex]);
	localStorage.setItem("last_visited_index",dbIndex); // saves the state AKA the last collection you had open
	if(imageDB==null){
		imageDB = [];
	}
	applyChanges();
	List();
	$('#txtInput').focus();
};

//CREATE a NEW collection	

var newCollection = function(){
	var new_collection;
	new_collection = prompt("Enter a name for your new collection","","New image collection");
	
	// if its bad input, just do nothing:
	if(new_collection==""||new_collection==null){ // force the user to give the collection a name
			$('#dropdown').prop("selectedIndex",(localStorage.getItem("last_visited_index"))); // a little trick to jump back out of the "new collection..." menu item
			return;
	}
	collections.push(new_collection); // add new collection
	localStorage.setItem("collection_names",JSON.stringify(collections)); // update the list of collection names ;
	changeCollection(collections.length-1); // Switch over to the new collection
	popDropdown();
	
};