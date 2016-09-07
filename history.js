var btnHistoryClicked = false;
$(function(){
	$('#btnHistory').on('click',function(){
		if(!btnHistoryClicked){
			$('.dropDownHistory').slideDown(100);
			btnHistoryClicked = true;
		}
		else{
			$('.dropDownHistory').slideUp(100);
			btnHistoryClicked = false;
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
	ctx.fillText(''+_history.length + '',6,15);
}

var generateHistoryThumbs = function(imgArray){
	var thumbnailer = document.createElement('canvas');
	var thumbs = [];
	
	thumbnailer.setAttribute('width','50px');
	thumbnailer.setAttribute('height','50px');
	thumbnailer.style.visibility = 'hidden';
	thumbnailer.setAttribute('id','canvHistoryThumbGenerate');
	$(thumbnailer).appendTo('body');
	log('thumbnailer appended to body.');
	
	
	for(var i in imgArray){
		thumbCtx = thumbnailer.getContext('2d');
		thumbCtx.drawImage(imgArray[i],0,0,thumbnailer.width,thumbnailer.height);
		log('image drawn to thumbnailer canvas.');
		var thumbImage = new Image();
		var dataURL = thumbnailer.toDataURL();
		console.log('thumbnailer url generated:' + dataURL);
		thumbImage.src = dataURL;
		// give thumb time to throw an error while loading
		thumbs.push(thumbImage);
		log('thumbs item pushed: ' + thumbImage);
	}
	
	// return array of thumbnails
	return thumbs;
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
			// change the text based on type of history item
			switch(item.restoreType){
				case 'deleted_library':
					text = 'Deleted "'+item.data.name+'"';
					subText = 'library';
					break;
				case 'deleted_collection':
					text = 'Deleted "'+item.data.name+'"';
					subText = 'collection';
					break;
				case 'deleted_image':
					text = 'Deleted "' + (item.data !== null ? (item.data.caption ? item.data.caption : 'item') : 'item') + '"';
					// choose subtext based on item type:
					if(item.data){
						if(item.data.type){
							subText = item.data.type; // let the subtext say whatever type of image,video,etc. it is via data.type
						}
					}
					else{
						subText = 'unknown'
					}
					break;
				default:
					text = 'History item';
					subText = item.restoreType;
					break;
			}
			
			// append the menu item
			list.append('<div class="dropDownMenuItem" name="history'+i+'"><span class="dropDownMenuItemText">'+text+'</span><span class="menuItemSubtext">'+subText+'</span></div>');
		});
		
		// bind click for each history item
		$('.dropDownHistory .dropDownMenuItem').on('hover',function(){
			console.log('hovering over history item.');
			$(this).nextAll().addClass('highlight');
		}).on('click',function(){
				
		});
		
		
	}
	else{
		list.append('<div class="dropDownMenuItem last"><span class="dropDownMenuItemText">History is empty.</span></div>');
	}
}

var Undo = function(){
	if (_history[0]!=null){
		var item = _history[_history.length-1]; // set item to the most recently _history
		var itemsLeft = _history.length - 1;
		if(item.restoreType==="deleted_image"){
			if(collectionIndex !== item.parentIndex){
				changeCollection(item.parentIndex);
			}
			imageDB.items.splice(item.index,0,item.data); // add the item back into the collection it was deleted from 
			applyChanges();
			List(false,function(){
				var element = document.getElementById(""+item.index+"");
				jumpToElementByScrollPosition(element,100,highlightRestore(element));
			});
			// notification. Update on trash, how many items left. If empty, just say that.				
			notify("Image restored. " + (_history.length - 1 > 0 ? itemsLeft + ' items left in trash.' : ' Trash is empty.'),"good");
		}
		else if(item.restoreType==="deleted_collection"){
			DATABASE.libraries[item.parentIndex].collections.splice(item.index,0,item.data);
			
			localStorage.setItem(CURRENT_DATABASE,JSON.stringify(DATABASE));
			changeLibrary(item.parentIndex);
			changeCollection(item.index);
			popDropdown();
			
			notify('Collection "' + item.data.name + '" restored. ' + itemsLeft + ' items left in trash.',"good");
		}
		else if(item.restoreType==="deleted_library"){
			DATABASE.libraries.splice(item.index,0,item.data);
			
			localStorage.setItem(CURRENT_DATABASE,JSON.stringify(DATABASE));
			changeLibrary(item.index);
			popLibrariesDropdown();
			
			notify('Library "' + item.data.name + '" restored. ' + itemsLeft + ' history items left.','good');
		}
		else if(item.restoreType==="added_image"){ // if last action was Add Image, then just remove the image
		
			if(collectionIndex===item.index){
				imageDB.items.splice(selected_index,1);
				applyChanges();
				List();
				
				notify("Image removed. "+ itemsLeft +" more Undo items.","neutral");
			}
		}
		else if(item.restoreType==="caption"){
			// restore the old caption:
			notify(' "' + imageDB.items[item.index].caption + '" reverted back to "' + item.caption + '". ' + itemsLeft +' _history items left.',"neutral");
			imageDB.items[item.index].caption = item.caption;
			List();
			
		}
		else if(item.restoreType==="collection_name"){
			var new_old_name = collections[item.collection_index].name;
			collections[item.collection_index].name = item.name;
			localStorage.setItem("collection_names",JSON.stringify(collections));
			changeCollection(item.collection_index);
			popDropdown();
			
			notify('Reverted collection "' + new_old_name + '" back to "' + item.name + '".','neutral');
			
		}
		else{
			return;
		}
	_history.splice(-1,1); // take the item out of UNDO list
	drawHistoryCountFlag();
	$('.dropDownHistory').children().last().slideUp(200,popHistoryDropdown); // refresh the history list
	}
};