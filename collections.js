//POPULATE the Dropdown of Collections

var selectCollectionItem = function(index){
	$('.collectionItem').removeClass('collectionItemClicked');
	$('.collectionItem').eq(index).addClass('collectionItemClicked');
	toggleCollections();

};


var collectionsButtonClicked = false;
var slidespeed = 50;

var toggleCollections = function(){
	var button = $('#btnCollections');
	var container = $('#collectionsContainer');
	
	if(collectionsButtonClicked==false){
		button.toggleClass('pressed');
		button.children('span').html('&#128314;');
		//button.css({backgroundColor:'gray'});
		container.slideDown(slidespeed);
		collectionsButtonClicked = true;
	}	
	else{
		button.toggleClass('pressed');
		button.children('span').html('&#128315;');
		//button.css({backgroundColor:'black'});
		container.slideUp(slidespeed);
		collectionsButtonClicked = false;
	}
}


var teaseSlideBackTimeout = 0;
var popDropdown = function(){
	

		/*$("#dropdown").html("");
		for(var c in collections){
				$("#dropdown").append("<option>"+collections[c]+"</option>");
			
		}
		$("#dropdown").append("<option>new collection...</option>");
		
		document.getElementById("dropdown").selectedIndex=dbIndex;*/
		
		// New Code:
		
		var container = $('#collectionsContainer');
			
		
		container.html("");
		for(var c in collections){
			$(container).append('<span class="collectionItem">'+collections[c]+'</span>');
		}
		// bind click event to collectionItems:
		$('.collectionItem').on('click',function(){
			selectCollectionItem($(this).index());
			changeCollection($(this).index());
		});
		
		// append "new collection" button to the end:
		$(container).append('<span id="btnNewCollection" class="collectionItem">+</span>');
		
		$(selectCollectionItem(dbIndex)); // select the collectionItem corresponding to the current dbIndex
		
		//bind new collection button click event
		$('#btnNewCollection').on('click',function(){
			newCollection();
		});
		
		
};

// CHANGE the current collection
var changeCollection=function(new_index){
	dbIndex = new_index;
	selectCollectionItem(dbIndex);
	imageDB = DATABASE[dbIndex];
	$("#collectionFooter").text(collections[dbIndex]);
	document.title = collections[dbIndex];
	localStorage.setItem("last_visited_index",dbIndex); // saves the state AKA the last collection you had open
	if(imageDB==null || typeof imageDB=='undefined'){
		imageDB = [];
	}
	applyChanges();
	List(true); // with animations
	$('#txtInput').focus();
};

//CREATE a NEW collection	

var newCollection = function(){
	var new_collection;
	new_collection = prompt("Enter a name for your new collection","","New image collection");
	
	// if its bad input, just do nothing:
	if(new_collection==""||new_collection==null){ // force the user to give the collection a name
			//$('#dropdown').prop("selectedIndex",(localStorage.getItem("last_visited_index"))); // a little trick to jump back out of the "new collection..." menu item
			$('#btnCollections').click();
			return;
	}
	collections.push(new_collection); // add new collection
	localStorage.setItem("collection_names",JSON.stringify(collections)); // update the list of collection names ;
	popDropdown();
	changeCollection(collections.length-1); // Switch over to the new collection

	
};

var renameCollection = function(newname){
	var new_name = $('#txtRenameCollection').val();
		var old_name = collections[dbIndex];
		// change collection name only if new name is a an actual name and not the old name
		if(new_name !== "" && new_name !== null && new_name !== old_name){
			collections[dbIndex] = new_name;
			localStorage.setItem("collection_names",JSON.stringify(collections));
			popDropdown();
			changeCollection(dbIndex);
			
			//notification
			notify('Renamed "' + old_name + '" to "' + new_name + '"',"good");
			// store old collection name in _history
			_history.push({restoreType:"collection_name",collection_index:dbIndex,name:old_name});
		}
}

$(function(){
	$(document).mouseup(function (e)
{
    var container = $("#collectionsContainer");
	var button = $('#btnCollections');

    if (!container.is(e.target) && container.has(e.target).length === 0 && !button.is(e.target) && button.has(e.target).length === 0){
		if(container.css('display')!=='none'){
			toggleCollections();
		}
    }
});
});