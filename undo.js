//////////////////////////////////////
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
	ctx.beginPath();
	ctx.arc(newFlag.width / 2,newFlag.height /2,newFlag.width /2 -2,0,Math.PI*2,false);
	ctx.fillStyle = 'red';
	ctx.fill();
	ctx.closePath();
	ctx.font = '10pt Arial';
	ctx.fillStyle = 'white';
	ctx.fillText(''+_history.length + '',6,15);
}

var pushHistoryItem = function(item){
	_history.push(item);
	drawHistoryCountFlag();
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
	}
};