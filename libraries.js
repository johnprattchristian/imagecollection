// click handler for delete library button
$(function(){
	$('#btnDeleteLibrary').on('click',function(){
		var yes = confirm('Are you sure you want to delete this library: "'+DATABASE.libraries[libraryIndex].name+'"?');
		if(yes){
			deleteLibrary();
		}
	});
	
	// hover over menu item
	$('.libraryMenuItem').on('hover',function(e){
		log('hover');
		$(this).children('.menuItemSubtext').addClass('hover');
	}).on('mouseout',function(){
		$(this).children('.menuItemSubtext').removeClass('hover');
	});
	
	$('#btnLibraries').on('click',function(){
		if($('#dropDownLibraries').css('display') === 'none'){
			$('.dropDown').hide();
			$('.toggleButton').removeClass('pressed');
			$('#dropDownLibraries').slideDown(100);
		}
		else{
			$('#dropDownLibraries').slideUp(100);
		}
	});
	
	
	// when losing focus, hide dropdown
	$(document).on('click',function(e){
		// if the click is not on library dropdown and not on the library button and not on one of the library dropdown children, then close the dropdown
		if(e.target !== document.getElementById('dropDownLibraries') && e.target !== $('#btnLibraries').get(0) && $('#dropDownLibraries').has(e.target).length === 0) {
			$('#dropDownLibraries').hide();
			$('#btnLibraries').removeClass('pressed');
		}
	});
});

var deleteLibrary = function(index){
		// push library to history to restore if needed
		pushHistoryItem({
			restoreType:'deleted_library',
			index:libraryIndex,
			data:DATABASE.libraries[libraryIndex]
		});
		log('pushed ' + history[history.length-1] + ' to history.');
		
		// notify user of deletion
		notify('Deleted user library "' + DATABASE.libraries[libraryIndex].name + '".','warning');
		
		DATABASE.libraries.splice(libraryIndex,1); // remove the library from the local copy of the db
		if(DATABASE.libraries.length < 1){
			// if left with no libraries, create a default one at index 0 before switching libraries
			DATABASE.libraries.splice(0,0,{
				name:'Library1',
				date_created:generateTimestamp(),
				collections:[{
					name:'My Collection',
					date_created:generateTimestamp(),
					items:[]
			}]});
		}
		
		// switch the library to one that exists, either backwards 1 or just library 0.
		popLibrariesDropdown();
		changeLibrary(libraryIndex > 0 ? libraryIndex - 1 : 0);
		
		applyChanges(); // apply changes to perma db
	
}

var newLibrary = function(libraryName){
	if(libraryName !== '' && libraryName.length > 1){
		DATABASE.libraries.push({
			name:libraryName,
			date_created:generateTimestamp(),
			collections:[{name:'Default',date_created:generateTimestamp(),items:[]}]
		});
		
		applyChanges();
		popLibrariesDropdown();
		changeLibrary(DATABASE.libraries.length - 1);
		notify('New library "' + libraryName + '" created.');
	}
	else{
		log('Name too short!');
	}
};

var popLibrariesDropdown = function(){
	var dropdown = $('#dropDownLibraries');
	dropdown.children('.dropDownMenuItem').remove();
	$('#blueCircle').hide() // hide the blue dot until it finds a home
	$(DATABASE.libraries).each(function(i,item){
		dropdown.append('<div class="dropDownMenuItem" name="library'+i+'"><span class="dropDownMenuItemText">'+item.name+'</span><span class="menuItemSubtext">'+item.collections.length+' collections</span></div>');
		if(i === libraryIndex){
			dropdown.children('.libraryMenuItem').last().append('<img id="blueCircle" src="blue-dot.png" height="15px" width="15px"></img>');
		}
	});
	dropdown.append('<div class="dropDownMenuItem last btnNewLibrary">New Library</div>');
	
	$('.btnNewLibrary').on('click',function(){
		setTimeout(function(){
		var result = prompt('Enter a name for the library.');
		if(result !== null){
			newLibrary(result);
		}
		},100)
	});
	
	$('.libraryMenuItem').not('.btnNewLibrary').on('click',function(){
		var newIndex = parseInt($(this).attr('name').replace('library',''));
		$('#blueCircle').remove();
		$(this).append('<img id="blueCircle" src="blue-dot.png"></img>');
		setTimeout(function(){
			changeLibrary(newIndex);
			$('#dropDownLibraries').hide(); // hide the dropdown
		},50);
	});
};

var changeLibrary = function(index){
	
	if(index > -1 && index !== libraryIndex){
		libraryIndex = index;
		collectionIndex = 0;
		
			// change the global variables to reflect the change
		collections = DATABASE.libraries[index].collections;
		imageDB = collections[collectionIndex];
		
		lastVisited.library = libraryIndex;
		lastVisited.collection = collectionIndex;
		setLastVisited();
		
		popLibrariesDropdown();
		popDropdown();
		changeCollection(0);
		List();
		
		//$('#btnLibraries').html(DATABASE.libraries[libraryIndex].name);
		notify('Switched to library "' + DATABASE.libraries[libraryIndex].name + '".');
	}
	else{
		if(index < 0){
			alert('selected index < 0');
		}
	}
	
	
}