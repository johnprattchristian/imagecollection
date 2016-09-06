var newLibrary = function(libraryName){
	if(libraryName !== '' && libraryName.length > 1){
		DATABASE.libraries.push({
			name:libraryName,
			date_created:generateTimestamp(),
			collections:[{name:'Default',date_created:generateTimestamp(),items:[]}]
		});
		
		applyChanges();
		changeLibrary(DATABASE.libraries.length - 1);
		notify('New library "' + libraryName + '" created.');
	}
	else{
		log('Name too short!');
	}
};

var popLibrariesDropdown = function(){
	var dropdown = $('#dropDownLibraries');
	dropdown.html('');
	$(DATABASE.libraries).each(function(i,item){
		dropdown.append('<div class="libraryMenuItem" name="library'+i+'"><span class="libraryTitle">'+item.name+'</span></div>');
		if(parseInt(dropdown.children('.libraryMenuItem').last().attr('name').replace('library','')) === libraryIndex){
			$('.blueCircle').appendTo(dropdown.children('.libraryMenuItem').last());
		}
	});
	dropdown.append('<div class="libraryMenuItem btnNewLibrary">+</div>');
	
	$('.btnNewLibrary').on('click',function(){
		var result = prompt('Enter a name for the library.');
		if(result !== null){
			newLibrary(result);
		}
	});
	
	$('.libraryMenuItem').not('.btnNewLibrary').on('click',function(){
		var newIndex = parseInt($(this).attr('name').replace('library',''));
		changeLibrary(newIndex);
	});
};

var changeLibrary = function(index){
	
	if(index > -1){
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
		
		notify('Switched to library "' + DATABASE.libraries[libraryIndex].name + '".');
	}
	else{
		alert('selected index < 0');
	}
	
	
}

// hide dropdown libraries when focus lost
$(document).ready(function(){
	$(document).on('click',function(e){
		if(e.target !== document.getElementById('dropDownLibraries') && e.target !== $('#btnLibrariesDropdown').get(0)){
			$('#dropDownLibraries').hide();
		}
	});
});