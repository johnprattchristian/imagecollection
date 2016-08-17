//////////////////////////////////////
var Undo = function(){
	if (_history[0]!=null){
		var item = _history[_history.length-1]; // set item to the most recently _history
		var itemsLeft = _history.length - 1;
		if(item.restoreType==="deleted_image"){
			if(dbIndex === item.index){ // check if on the same collection where the image was deleted 
				imageDB.splice(item.indexOfImage,0,item.imageURL); // add the item back into the collection it was deleted from 
				applyChanges();
				List(false,function(){
					var element = document.getElementById(""+item.indexOfImage+"");
					jumpToElementByScrollPosition(element,100,highlightRestore(element));
				});
				// notification. Update on trash, how many items left. If empty, just say that.				
				notify("Image restored. " + (_history.length - 1 > 0 ? itemsLeft + ' items left in trash.' : ' Trash is empty.'),"good");
			}
		}
		else if(item.restoreType==="deleted_collection"){
			DATABASE.splice(item.index,0,item.collectionContent); // add the deleted collection back into DATABASE; 0=index of collection IN DATABASE 2=all the fucking data

			collections.splice(item.index,0,item.collectionName); //1 = the name of the collection
			localStorage.setItem("collection_names",JSON.stringify(collections));
			localStorage.setItem("imageDB",JSON.stringify(DATABASE));
			changeCollection(item.index);
			popDropdown();
			
			
			notify('Collection "' + item.collectionName + '" restored. ' + itemsLeft + ' items left in trash.',"good");
		}
		else if(item.restoreType==="added_image"){ // if last action was Add Image, then just remove the image
		
			if(dbIndex===item.index){
				imageDB.splice(selected_index,1);
				applyChanges();
				List();
				
				notify("Image removed. "+ itemsLeft +" more Undo items.","neutral");
			}
		}
		else if(item.restoreType==="caption"){
			// restore the old caption:
			notify(' "' + imageDB[item.index].caption + '" reverted back to "' + item.caption + '". ' + itemsLeft +' _history items left.',"neutral");
			imageDB[item.index].caption = item.caption;
			List();
			
		}
		else if(item.restoreType==="collection_name"){
			var new_old_name = collections[item.collection_index];
			collections[item.collection_index] = item.name;
			localStorage.setItem("collection_names",JSON.stringify(collections));
			changeCollection(item.collection_index);
			popDropdown();
			
			notify('Reverted collection "' + new_old_name + '" back to "' + item.name + '".','neutral');
			
		}
		else{
			return;
		}
	_history.splice(-1,1); // take the item out of UNDO list
	}
};