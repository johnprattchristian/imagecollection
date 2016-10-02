var btnHistoryClicked = false;
$(function(){
	$('#btnHistory').on('click',function(){
		$('.dropDownHistory').slideToggle(100);
	});
	
	// resset highlighting
	$('.dropDownHistory').on('mouseleave',function(){
		$(this).children().removeClass('highlight').removeClass('pressed');
	});
	
	$(document).on('click',function(e){
		log('clicked');
		if($('.dropDownHistory').css('display')!=='none' && $('.dropDownHistory').has(e.target).length == 0 && !$('.dropDownHistory').is(e.target) && !$('#btnHistory').is(e.target) && $('#btnHistory').has(e.target).length == 0){
			$('.dropDownHistory').hide();
			$('#btnHistory').removeClass('pressed');
		}
	});
	
	/*$(document).on('click',function(e){
		if(e.target !== document.getElementById('btnHistory') && $('.dropDownHistory').has(e.target).length < 1){
			$('.dropDownHistory').hide();
		}
	});*/
});

var drawHistoryCountFlag = function(){
	$('#btnHistory canvas').remove();
	if(_history.length < 1){
			return;
	}
	var newFlag = document.createElement('canvas');
	newFlag.width = 20;
	newFlag.height = 20;
	newFlag.setAttribute('id','canvHistoryCount');
	//newFlag.style.border = 'solid 1px black';
	newFlag.style.verticalAlign = 'text-bottom';
	newFlag.style.marginLeft = '5px';
	$('#btnHistory').append(newFlag);
	var ctx = $('#canvHistoryCount').get(0).getContext('2d');
	for(var digits in (''+_history.length+'').split('')){
		ctx.beginPath();
		console.log ((''+_history.length+'').split('').length + ' digits in _history.length.');
		ctx.arc(newFlag.width / 2 + digits,newFlag.height /2,newFlag.width /2 -2,0,Math.PI*2,false);
		ctx.fillStyle = 'black';
		ctx.fill();
		ctx.closePath();
	}
	ctx.font = '9pt Arial';
	ctx.fillStyle = 'white';
	// draw the number to the button:
	ctx.fillText(''+_history.length + '',6,15);
}

var pushHistoryItem = function(item){
	_history.push(item);
	drawHistoryCountFlag();
	popHistoryDropdown();
}

var popHistoryDropdown = function(){
	var list = $('.dropDownHistory');
	$('.dropDownHistory').html(''); // clear the current list
	
	// iterate through history items and make into menu items
	if(_history.length > 0){
		$(_history).each(function(i,item){
			var text = ''; // primary text
			var subText = ''; // the grayed-out text
			var thumbDom = $('<div class="historyItemThumb"></div>');
			// change the text based on type of history item
			switch(item.restoreType){
				case 'deleted_library':
					text = 'Deleted "'+item.data.name+'"';
					subText = 'library';
					break;
				case 'deleted_collection':
					text = 'Deleted "'+item.data.name+'"';
					subText = 'collection';
					thumbDom.css('background-image','url("'+'./images/collection-icon.png'+'")');
					break;
				case 'deleted_image':
					text = 'Deleted "' + (item.data !== null && typeof item.data !== 'undefined' ? (item.data.caption ? item.data.caption : 'item') : 'item') + '"';
					// choose subtext based on item type:
					if(item.data){
						if(item.data.type){
							subText = item.data.type; // let the subtext say whatever type of image,video,etc. it is via data.type
						}
						if(typeof item.data.type !== 'undefined'){
							if(typeof item.data.url !== 'undefined'){
								if(item.data.type === 'image'){
									thumbDom.css('background-image','url('+item.data.url+')');
								}
								else if(item.data.type === 'video'){
									thumbDom.css('background-image','url("./images/video-icon-dimgray.png")');
								}
							}
							if(item.data.type === 'plain_text'){
								thumbDom.css('background-image','url("./images/text-icon-dimgray.png")');
								text = 'Deleted text "'+item.data.content+'"';
							}
						}
					}
					else{
						subText = 'unknown'
					}
					break;
				case 'caption':
					var caption = '';
					if(typeof imageDB.items[item.index] !== 'undefined' && imageDB.items[item.index].caption !== null){
						caption = '"' + imageDB.items[item.index].caption + '"';
					}
					else{
						caption = 'CAPTION';
					}
					text = '"'+item.caption+'" to ' + caption;
					subText = item.restoreType;
					break;
				case 'collection_name':
					text = '"'+item.name+'" to "'+imageDB.name+'"';
					subText = item.restoreType;
					break;
				default:
					text = 'History item';
					subText = item.restoreType;
					break;
			}
			
			// append the menu item
			list.append('<div class="dropDownMenuItem" name="history'+i+'">'+thumbDom.prop('outerHTML')+'<div class="historyItemRightSide"><span class="dropDownMenuItemText">'+text+'</span><span class="menuItemSubtext">'+subText+'</span></div></div>');
		});
		
		// bind click for each history item
		$('.dropDownHistory .dropDownMenuItem').on('mousemove',function(){
			console.log('hovering over history item.');
			$('.dropDownHistory .dropDownMenuItem').removeClass('highlight');
			$(this).addClass('highlight');
			$(this).nextAll().addClass('highlight');
		}).on('mouseleave',function(){
			$(this).removeClass('highlight');
		}).on('mousedown',function(){
			$(this).add($(this).nextAll()).addClass('pressed');
			
		}).on('mouseup',function(){
			$(this).add($(this).siblings()).removeClass('pressed');
		}).on('click',function(){
			var index = parseInt($(this).attr('name').replace('history',''));
			var noOfItems = _history.length - index;
			log('restoring back to history item #'+index+'...');
			// restore all history back to this point
			Undo(noOfItems);
		});
		
		
	}
	else{
		list.append('<div class="dropDownMenuItem last"><span class="dropDownMenuItemText">History is empty.</span></div>');
		if($('#btnHistory').hasClass('pressed')){
			setTimeout(function(){
				$('#btnHistory').click();
			},500);
		}
	}
}

var Undo = function(numberOfItems = 1){
	if (_history[0]!==null){
		
		var undoItems = _history.slice(0);
		undoItems = undoItems.splice(-numberOfItems);
		var itemsLeft = _history.length - numberOfItems;
		// lowers processing for multiple undos at once
		for(var x = 0;x < numberOfItems;x++){
			var item = undoItems[(undoItems.length - 1)-x]; // set item to the x iteration of undoItems
			var itemsLeft = _history.length - 1;
				
			log('undoItems :');
			log(undoItems);	
			
			if(item.restoreType==="deleted_image"){
				// go to the collection that the image was deleted from 
				if(collectionIndex !== item.parentIndex){
					changeCollection(item.parentIndex);
				}
				imageDB.items.splice(item.index,0,item.data); // add the item back into the collection it was deleted from 
				// applyChanges(); unnecessary
				
				// only call List() and animate on last deleted_image being restored
				doIfLastOfRestoreType(undoItems,x,item.restoreType,function(){
					List(false,function(){
						var element = document.getElementById(""+item.index+"");
						jumpToElementByScrollPosition(element,100,highlightRestore(element));
					});
					// notification. Update on trash, how many items left. If empty, just say that.				
					notify("Image restored. " + (_history.length - 1 > 0 ? itemsLeft + ' history items left.' : ' History is empty.'),"good");
				});
			}
			else if(item.restoreType==="deleted_collection"){
				DATABASE.libraries[item.parentIndex].collections.splice(item.index,0,item.data);
				
				//localStorage.setItem(CURRENT_DATABASE,JSON.stringify(DATABASE));
				
				// only do all this if its the last collection being restored in the multi-Undo
				doIfLastOfRestoreType(undoItems,x,item.restoreType,function(){
					changeLibrary(item.parentIndex);
					changeCollection(item.index);
					popDropdown();
					notify('Collection "' + item.data.name + '" restored. ' + itemsLeft + ' history items left.',"good");
				});
			}
			else if(item.restoreType==="deleted_library"){
				DATABASE.libraries.splice(item.index,0,item.data);
				
				doIfLastOfRestoreType(undoItems,x,item.restoreType,function(){
					changeLibrary(item.index);
					popLibrariesDropdown();				
					notify('Library "' + item.data.name + '" restored. ' + itemsLeft + ' history items left.','good');
				});
			}
			else if(item.restoreType==="added_image"){ // if last action was Add Image, then just remove the image
			
				if(collectionIndex===item.index){
					imageDB.items.splice(selected_index,1);
					//applyChanges();
					
					doIfLastOfRestoreType(undoItems,x,item.restoreType,function(){
						List();
						
						notify("Image removed. "+ itemsLeft +" history items left.","neutral");
					});
				}
			}
			else if(item.restoreType==="caption"){
				// restore the old caption:
				
				imageDB.items[item.index].caption = item.caption;
				
				doIfLastOfRestoreType(undoItems,x,item.restoreType,function(){
					List();
					notify(' "' + imageDB.items[item.index].caption + '" reverted back to "' + item.caption + '". ' + itemsLeft +' history items left.',"neutral");
				});
			}
			else if(item.restoreType==="collection_name"){
				var new_old_name = collections[item.index].name;
				DATABASE.libraries[libraryIndex].collections[item.index].name = item.name;
				//localStorage.setItem("collection_names",JSON.stringify(collections));
				doIfLastOfRestoreType(undoItems,x,item.restoreType,function(){
					changeCollection(item.index);
					popDropdown();
					notify('Reverted collection "' + new_old_name + '" back to "' + item.name + '".','neutral');
				});
			}
			else{
				return;
			}
			
			// notify of multiple undos if more than 1
			if(numberOfItems > 1){
				notify('Restored ' + numberOfItems + ' history items.','good');
				if(_history.length == 0){
					notify('History is empty.','good');
				}
			}
			
			// cut out the last _history item
			//undoItems.splice(-1);  dont splice this, because the one that matters _history is spliced
			_history.splice(-1); // take the item out of full history list
			
			drawHistoryCountFlag();
			$('.dropDownHistory').children().last().slideUp(200,popHistoryDropdown); // refresh the history list
		}
	// update collections after restoring images
	popDropdown();
	}
};

var doIfLastOfRestoreType = function(array,currentIndex,restoreType,funct){
	var lastIndex = lastIndexOfRestoreType(array,restoreType);
	if(currentIndex === lastIndex){
		log('is last of restore type!');
		funct();
	}
};