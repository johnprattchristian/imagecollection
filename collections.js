//POPULATE the Dropdown of Collections

var tm_containerSlideUp = 0;
var selectCollectionItem = function(index){
	// clearTimeout(tm_containerSlideUp);
	$('.collectionItem').removeClass('collectionItemClicked');
	$('.collectionItem').eq(index).addClass('collectionItemClicked');
	/*tm_containerSlideUp = setTimeout(function(){
		toggleCollections(100);
	},100);*/
};


var collectionsButtonClicked = false;

var showCollections = function(animation = true,slidespeed = 50){
	var container = $('#collectionsContainer');
	var button = $('#btnCollections');
	
	button.addClass('pressed');
	button.children('span').html('&#128314;');
	//button.css({backgroundColor:'gray'});
	container.slideDown(slidespeed);
	$('.spacer#top').animate({height:'130px'},slidespeed);
	collectionsButtonClicked = true;
};

var hideCollections = function(animation = true,slidespeed = 50){
	var container = $('#collectionsContainer');
	var button = $('#btnCollections');
	

	if(collectionsButtonClicked==false){
		button.toggleClass('pressed');
		button.children('span').html('▲');
		//button.css({backgroundColor:'gray'});
		container.slideDown(slidespeed);
		
		$('.spacer#top').animate({height:'130px'},slidespeed);
		collectionsButtonClicked = true;
	}	
	else{
		button.toggleClass('pressed');
		button.children('span').html('▼');
		//button.css({backgroundColor:'black'});

	}
	//button.css({backgroundColor:'black'});
	if(animation){
		container.slideUp(slidespeed);
		$('.spacer#top').animate({height:'90px'},slidespeed);
	}
	else{
		container.hide();
		$('.spacer#top').css('height','90px');
	}
	collectionsButtonClicked = false;
};

var toggleCollections = function(slidespeed = 50,trueSlideUp_falseSlideDown){
	var button = $('#btnCollections');
	var container = $('#collectionsContainer');
	
	if(collectionsButtonClicked==false || trueSlideUp_falseSlideDown === false){
		showCollections(undefined,50);
	}	
	else if(collectionsButtonClicked==true || trueSlideUp_falseSlideDown == true){
		hideCollections(undefined,50);
	}
};


var teaseSlideBackTimeout = 0;
var popDropdown = function(){
	

		/*$("#dropdown").html("");
		for(var c in collections){
				$("#dropdown").append("<option>"+collections[c]+"</option>");
			
		}
		$("#dropdown").append("<option>new collection...</option>");
		
		document.getElementById("dropdown").selectedIndex=collectionIndex;*/
		
		// New Code:
		
		var container = $('#collectionsContainer');
			
		
		container.children('.collectionItem').each(function(i,item){
			$(item).remove();
		});
		for(var c in collections){
			$(container).append('<span class="collectionItem">'+collections[c].name+'</span>');
		}
		// bind click event to collectionItems:
		$('.collectionItem').on('click',function(){
			selectCollectionItem($(this).index());
			changeCollection($(this).index());
		});
		
		
		
		// append "new collection" button to the end:
		$(container).append('<span id="btnNewCollection" class="collectionItem">+</span>');
		
		$(selectCollectionItem(collectionIndex)); // select the collectionItem corresponding to the current collectionIndex
		
		//bind new collection button click event
		$('#btnNewCollection').on('click',function(){
			newCollection();
		});
		
		
		
};

// CHANGE the current collection
var changeCollection=function(new_index){
	collectionIndex = new_index;
	
	imageDB = DATABASE.libraries[libraryIndex].collections[collectionIndex];
	$("#collectionTitleSpan").html(collections[collectionIndex].name);
	document.title = collections[collectionIndex].name;
	
	
	// saves the state AKA the last collection you had open
	lastVisited.collection = collectionIndex;
	setLastVisited(); // sets the localStorage last_visited_index object
	
	if(imageDB==null || typeof imageDB=='undefined'){
		imageDB = {
			name:'[collection]',
			date_created:generateTimestamp(),
			items:[]
		};
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
	applyChanges();
	popDropdown();
	changeCollection(collections.length-1); // Switch over to the new collection

	
};

// DELETE a collection
var deleteCollection=function(){
	var really = confirm("Are you sure you want to delete '"+collections[collectionIndex].name+"'?");
		if (collections.length>1){
			if(really){
				var new_deleted = {
					restoreType:"deleted_collection",
					index:collectionIndex,
					collectionName:collections[collectionIndex].name,
					collectionContent:imageDB
				};
				_history.push(new_deleted); // push the new _history state for undo
				DATABASE.splice(collectionIndex,1); //delete the collection from DATABASE
				collections.splice(collectionIndex,1); // remove its name from collection_names
				localStorage.setItem("collection_names",JSON.stringify(collections));
				localStorage.setItem("imageDB",JSON.stringify(DATABASE));
				changeCollection(collectionIndex-1); // Now that this doesn't exist, go back 1 collection 
				popDropdown(); // refresh the dropdown of collections
				
				setTimeout(notify('"' + new_deleted.collectionName + '" deleted',"warning"),100);
				return;
				
				
			}
			else{
				
				return;
			}
		}
		else{
			notify('Must have at least 1 collection!','warning'); // this is to preserve the indexing of collections
		}
};

var renameCollection = function(newname){
	
	var new_name = $('#txtRenameCollection').val();
		var old_name = collections[collectionIndex].name;
		// change collection name only if new name is a an actual name and not the old name
		if(new_name !== "" && new_name !== null && new_name !== old_name){
			collections[collectionIndex].name.name = new_name;
			applyChanges();
			popDropdown();
			changeCollection(collectionIndex);
			
			//notification
			notify('Renamed "' + old_name + '" to "' + new_name + '"',"good");
			// store old collection name in _history
			_history.push({restoreType:"collection_name",collection_index:collectionIndex,name:old_name});
		}
}

$(function(){
	$(document).on('mousedown',function (e){
		var container = $("#collectionsContainer");
		var button = $('#btnCollections');

		if (!container.is(e.target) && container.has(e.target).length === 0 && !button.is(e.target) && button.has(e.target).length === 0){
			if(container.css('display')!=='none'){
				toggleCollections();
			}
		}
	});

	var lastScrollTop = 0;
	var goingUp = true;
	var howManyThisDirection = 0;
	var elasticity = 10;
	$(window).on('scroll',function(e){
		// Annoying behavior? 
		/* var current = $(window).scrollTop();
		var stillGoingUp = (current < lastScrollTop);
		
		if(stillGoingUp !== goingUp){
			howManyThisDirection = 0;
		}
		
		
		if(current < lastScrollTop){
			if(howManyThisDirection > 1){
				showCollections();
			}
			goingUp = true;
		}
		else if(current > lastScrollTop){
			if(howManyThisDirection > elasticity){
				hideCollections();
			}
			goingUp = false;
		}
		lastScrollTop = current;
		
		howManyThisDirection += 1;
		log((stillGoingUp ? 'going up. so far: ' : 'going down: ') + howManyThisDirection );
		*/
	});
});