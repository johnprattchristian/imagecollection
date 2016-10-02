// declare good heights for the spacer that seperates the imageList from the top of the document
var spacerBigHeight = '130px',
	spacerSmallHeight = '80px';

var tm_containerSlideUp = 0;
var selectCollectionItem = function(index){
	// clearTimeout(tm_containerSlideUp);
	$('.collectionItem').removeClass('collectionItemClicked');
	$('.collectionItem[data-collection-index="'+index+'"]').addClass('collectionItemClicked');
	/*tm_containerSlideUp = setTimeout(function(){
		toggleCollections(100);
	},100);*/
};


var collectionsButtonClicked = false;

var showCollections = function(animation = true,slidespeed = 50){
	var container = $('#collectionsContainer');
	var button = $('#btnCollections');
	
	button.addClass('pressed');
	button.children('span').html('&#9650;');
	//button.css({backgroundColor:'gray'});
	if(animation){
		container.slideDown(slidespeed);
	}
	else{
		container.show();
	}
	$('.spacer#top').animate({height:spacerBigHeight},slidespeed);
	collectionsButtonClicked = true;
};

var hideCollections = function(animation = true,slidespeed = 50){
	var container = $('#collectionsContainer');
	var button = $('#btnCollections');
	
	button.removeClass('pressed');
	//button.css({backgroundColor:'gray'});
	
	button.children('span').html('▼');
	//button.css({backgroundColor:'black'});
	
	//button.css({backgroundColor:'black'});
	if(animation){
		container.slideUp(slidespeed);
		$('.spacer#top').animate({height:spacerSmallHeight},slidespeed);
	}
	else{
		container.hide();
		$('.spacer#top').css('height',spacerSmallHeight);
	}
	collectionsButtonClicked = false;
};

var toggleCollections = function(slidespeed = 50,trueSlideUp_falseSlideDown){
	var button = $('#btnCollections');
	var container = $('#collectionsContainer');
	
	if(collectionsButtonClicked==false || trueSlideUp_falseSlideDown === false){
		showCollections(false,50);
	}	
	else if(collectionsButtonClicked==true || trueSlideUp_falseSlideDown == true){
		hideCollections(true,50);
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
		container.children().each(function(i,item){
				$(item).remove();
			});
		
		// allow different sorting of collections, such as alphabetical,
		// sort type is embedded in current library as a property
		var sort = typeof libraries[libraryIndex].sort === 'string' ? libraries[libraryIndex].sort : 'date_newold';
		
		// pass to the sort function to sort based on the sortType
		var sorted = sortGeneric(libraries[libraryIndex].collections,sort);
		for(var i in sorted){
			var item = sorted[i];
			$(container).append('<span class="collectionItem" data-collection-index="'+item.index+'">'+item.name+'<span class="collectionCounter">'+item.item_count+'</span></span>');
		}
		
		
		// bind click event to collectionItems:
		$('.collectionItem').on('click',function(){
			selectCollectionItem(parseInt($(this).attr('data-collection-index')));
			var newIndex = parseInt($(this).attr('data-collection-index'));
			changeCollection(newIndex);
		});
		
		$(selectCollectionItem(collectionIndex)); // select the collectionItem corresponding to the current collectionIndex
		
		// New collection
		// append "new collection" button to the end:
		$(container).append('<span id="btnNewCollection" class="collectionItem">+</span>');
		
		//bind new collection button click event
		$('#btnNewCollection').on('click',function(){
			setTimeout(newCollection,20);
		});
		
		// Sorting
		// create sorting list box
		$(container).append('<label>Sorting: </label><select id="sortCollectionsDropdown">'
		+'<option data-sort="date_newold">New→Old</option>'
		+'<option data-sort="date_oldnew">Old→New</option>'
		+'<option data-sort="alpha_az">A→Z</option>'
		+'<option data-sort="alpha_za">Z→A</option>'
		+'<option data-sort="itemcount_longshort">3,2,1</option>'
		+'<option data-sort="itemcount_shortlong">1,2,3</option>'
		+'</select>');
		
		$('#sortCollectionsDropdown').children('option[data-sort="'+sort+'"]').prop('selected',true);
		$('#sortCollectionsDropdown').on('change',function(){
			var selectedSorting = $('#sortCollectionsDropdown option:selected');
			log(selectedSorting);
			changeCollectionSorting($('#sortCollectionsDropdown option:selected').attr('data-sort'));
		});
		
		updateUIColor();
		
};

var checkThemeCache = function(){
	if(typeof imageDB.themeCache !== 'undefined'){
		if(imageDB.themeCache || imageDB.themeCache.sampleSize !== $('.imageBox img').length){ // colors,etc. generated for the collection. If the sample size (number of images) has changed, create a new theme color:
			var theme = imageDB.themeCache; // an object property with different theme props in the collection
			changeBarColors(theme.colors.navBars);
		}
		else{
			setTimeout(function(){
				log('generating new theme for ' + imageDB.name);
				dynamicColorBars();
			},1000);
		}
	}
};

// CHANGE the current collection
var changeCollection=function(new_index){
	if(new_index < 0){
		changeCollection(0);
		log("can't move back that far in collections");
		return;
	}
	collectionIndex = new_index;
	
	imageDB = DATABASE.libraries[libraryIndex].collections[collectionIndex];
	$(".collection-title-bottom").html(DATABASE.libraries[libraryIndex].collections[collectionIndex].name);
	document.title = collections[collectionIndex].name;
	updateUIColor();
	
	if(imageDB==null || typeof imageDB=='undefined'){
		imageDB = {
			name:'[collection]',
			date_created:generateTimestamp(),
			items:[]
		};
	}
	
	// saves the state AKA the last collection you had open
	lastVisited.collection = collectionIndex;
	setLastVisited(); // sets the localStorage last_visited_index object
	
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
			log('collection not created');
			$('#btnCollections').click();
			return;
	}
	DATABASE.libraries[libraryIndex].collections.push({
		name:new_collection,
		date_created:generateTimestamp(),
		items:[]
	}); // add new collection
	changeCollection(DATABASE.libraries[libraryIndex].collections.length-1); // Switch over to the new collection
	popDropdown();
	popLibrariesDropdown();
	applyChanges();
};

// DELETE a collection
var deleteCollection=function(){
	var really = confirm("Are you sure you want to delete '"+DATABASE.libraries[libraryIndex].collections[collectionIndex].name+"'?");
		if (collections.length>1){
			if(really){
				var new_deleted = {
					restoreType:"deleted_collection",
					index:collectionIndex,
					data:imageDB,
					parentIndex:libraryIndex
				};
				pushHistoryItem(new_deleted); // push the new _history state for undo
				log('pre-slice: collections length = ' + collections.length);
				DATABASE.libraries[libraryIndex].collections.splice(collectionIndex,1); //delete the collection from DATABASE
				log('post-slice: collections length =' + collections.length);
				changeCollection(collectionIndex-1); // Now that this doesn't exist, go back 1 collection
				applyChanges();
				popDropdown(); // refresh the dropdown of collections
				popLibrariesDropdown();
				setTimeout(notify('"' + new_deleted.data.name + '" deleted',"warning"),100);
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
		var old_name = DATABASE.libraries[libraryIndex].collections[collectionIndex].name;
		// change collection name only if new name is a an actual name and not the old name
		if(new_name !== "" && new_name !== null && new_name !== old_name){
			DATABASE.libraries[libraryIndex].collections[collectionIndex].name = new_name;
			applyChanges();
			popDropdown();
			changeCollection(collectionIndex);
			
			//notification
			notify('Renamed "' + old_name + '" to "' + new_name + '"',"good");
			// store old collection name in _history
			pushHistoryItem({
				restoreType:"collection_name",
				index:collectionIndex,
				name:old_name
			});
		}
}

var changeCollectionSorting = function(type,libIndex = libraryIndex){
	if(sortTypes.indexOf(type) > -1){
		libraries[libIndex].sort = type;
		applyChanges();
		popDropdown();
	}
	else{
		log('cannot change sorting. invalid sortType: ' + type);
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