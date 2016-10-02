//DELETE AN IMAGE
var Delete = function(domElement = null){
	
	//alert(selected_index);
		//alert($(this).attr("id"));
		
		//FOR UNDO add item to list of deleted items FOR UNDO:
			var new_deleted = {
					restoreType:"deleted_image",
					parentIndex:collectionIndex,
					index:selected_index,
					data:imageDB.items[selected_index]
					//,thumbnails:generateHistoryThumbs([$(domElement).children('img,video').get(0)]) // send an array of 1 image as the argument
				// value:[which collection,the index of the image in the collection,the src url of the image]
			};
			pushHistoryItem(new_deleted);
		//
		if(audio_playing_index>=0){
			if(selected_index<audio_playing_index){
				audio_playing_index-=1;
			}
			else if(selected_index===audio_playing_index){
				audio_playing_index=-1;
			}
		}
		//remove the item
		imageDB.items.splice(selected_index,1);
		
		//applyChanges();
		popDropdown(); // change the collection count
		
		var currentscroll = $(window).scrollTop();
		$(domElement).fadeOut('fast',function(){
			List(false,function(){
				$(document).scrollTop(currentscroll);
			});
		});
		
		notify("Image deleted","warning");
};

var tm_afterlistcallback = 0; // timeOut for after the list is completed. wait until perform callback
var List = function(load_animation = false,callback){
	// Populate images
	clearTimeout(tm_afterlistcallback);

	$('.column').remove();
	
	// refresh images array for dynamicColorBars
	images = [];
	
	
	// generate the columns for laying out the images
	for(var i=0;i < no_of_columns;i++){
			$('#imageList').append('<div class="column" id="col'+i+'"></div>');
	}
	
	var current_column = 0; // the column to populate. iterate through the four
	// set a default sort type	
	
	// iterate the collection and display images
	for(var i = imageDB.items.length -1;i > -1;i--){
	//for(var x = sortedArray.length - 1;x>-1;x--){
		var item = imageDB.items[i];
		// Finally, LAYOUT the images and videos in the view // 
		// Give image and corresponding controls the same id for easy access:
		
		// create new container box
		var newBox = $('<div class="imageBox" data-item-index="'+i+'"></div');
		
		// appendings for only images and videos
		if(item.type==='image' || item.type ==='video' || item.type === 'youtube'){
			var element = processURL(i);
			var loading_img = '<img class="loading-animation" src="./images/loading.gif">';
			var caption = "<div class='caption'><span class='captionText'>" + processCaption(imageDB.items[i])
			+"</span><button class='btnEditCaption'>&#128393;</button></div>"; // add edit button to image caption
			newBox.append(element).append(loading_img).append(caption);
		}
		else if(item.type==='plain_text'){
			var textContentDiv = $('<div class="textItemContainer">'+item.content+'</div>');
			newBox.append(textContentDiv);
			textContentDiv.css({
				'font-size' : '20pt',
				color: item.colors.foreground,
				background: item.colors.background,
				padding:'100px',
				'white-space' : 'pre-wrap',
				'text-align' : 'center'
			});
		}
		// add controls like DELETE
		newBox.append("<button class='btnDelete' data-item-index='"+i+"'>x</button>");
		
		// append this item to the current iterating column
		$("#imageList .column").eq(current_column).append(newBox);
		
		//alert($('.column').attr('id'));
		// iterate to the next column
		if(current_column < no_of_columns - 1){
			current_column++;
		}
		else{
			current_column = 0;
		}
	}
	
	muteAll();
	updateVolumes();
	
	// Put bindings on all elements after calling List():

	
	$('#imageList video.media-item').css('opacity',0.4).on('loadeddata',function(){
		//$(this).parent().fadeIn(1000);
		$(this).siblings('.loading-animation').remove();
		$(this).css('opacity',1);
		
		if (typeof this.webkitAudioDecodedByteCount !== "undefined") {
			// non-zero if video has audio track
			if (this.webkitAudioDecodedByteCount > 0){
				var thisId = this.getAttribute('data-index');
				// create unmute button:
				var unmuteButton = $('<button/>',{id:'unmute'+thisId});
				unmuteButton.addClass('btnUnmute')
				.html('&#128266;')
				.on('click',function(){
					var video = document.getElementById(thisId);
					if(video.muted){
						muteAll();
						Unmute(video);
					}
					else{
						muteAll();
					}
					
					checkMuted();
				});
				
				// append to video:
				$(this).parent().append(unmuteButton);
				
			}
			else{
			}
		}
	}).on('error',function(){
		$(this).parent().show();
		$(this).css('border','solid 2px red').parent().children('.btnDelete').css('borderColor','rgba(255,0,0,0.7)');
		notify("Some images could not be loaded.",'warning');
	});
	
	// unmute the previously unmuted video if any
	if(audio_playing_index>=0){
		var unmuteVideo = document.getElementById(audio_playing_index);
		$(unmuteVideo).prop('muted',false);
	}

	$('.imageBox img.media-item').css('opacity',0.4).on('load',function(){
			//$(this).parent().fadeIn(500);
			$(this).siblings('.loading-animation').remove();
			$(this).css('opacity',1);
			//pushImageToDynamicColor(this);
		}).on('error',function(){
			$(this).parent().show();
			$(this).addClass('loadError').height(250)
			.parent().children('.caption').addClass('loadError').html('Error loading image');
			$(this).parent().children('.btnDelete').addClass('loadError');
			
			
			notify("Some images could not be loaded.",'warning');
	});
	
	$('iframe.media-item').on('load',function(){
		$(this).siblings('.loading-animation').remove();
	});

		
	// mouseenter / mouseleave imageBox binds for fading captions
	$('.imageBox').bind('mousemove',function(e){
			$(this).children('.caption').show();
	});
	
	$('.imageBox').bind('mouseleave',function(e){
		if($(this).has('.txtEditCaption').length === 0){
			$(this).children('.caption').fadeOut(100);
		}
	});

	// bind delete buttons events
	$(".btnDelete").bind("click",function(){
		selected_index = parseInt($(this).attr("data-item-index"));
		Delete($(this).parent());
	});
	
	// show the Caption editor
	var editImageCaption = function(element){
		$(element).children('.captionText').hide();
		$(element).prepend('<textarea class="txtEditCaption"/>');
		
		$('.txtEditCaption').val(getCaption(imageDB.items[selected_index])) // put in the old caption
		.on('keydown',function(e){
			if(!e.shiftKey && e.which == 13){
				e.preventDefault();
				changeCaption(selected_index,$(this).val()); // change image caption to whatever's in the textarea
			$(element).children('.captionText').show();
			$(element).children('.txtEditCaption').remove();
			}
		}).on('blur',function(){
			changeCaption(selected_index,$(this).val()); // change image caption to whatever's in the textarea
			$(element).children('.captionText').show();
			$(element).children('.txtEditCaption').remove();
		}).focus().select();
	};
	
	// Edit caption button binds
	$(".btnEditCaption").bind("click",function(){
		selected_index = parseInt($(this).closest('.imageBox').attr("data-item-index")); // gets the image's index for editing
		editImageCaption($(this).parent().get(0));
	});
	
	//DOUBLE CLICK IMAGE binds -- fullscreen 
	$("img.media-item").bind("dblclick",function(e){
		e.preventDefault();
		selected_index = parseInt($(this).attr("data-index")); // this is so we can display a notification
		fullscreenImage(this);
	});
	$("video.media-item").bind("dblclick",function(e){
		e.preventDefault();
		selected_index = parseInt($(this).attr("data-index"));
		fullscreenVideo(this);		
	});
	
	/*$('body').on('contextmenu',function(e){
		e.preventDefault();
	});*/
	
	$('img.media-item').bind('contextmenu',function(e){
		e.preventDefault();
	})
	.on('mousedown',function(e){
		if(e.which===3){
			if(getSetting('quickPreview').value===true){
					var fillPreview = $('.fillPreview');
				fillPreview.css({
					background:'url("'+$(this).attr('src')+'") no-repeat center ',
					backgroundColor:'rgba(0,0,0,0.9',
					backgroundSize:'contain',
					cursor:'none'
				}).show();
			}
		}
	})
	.on('mouseup',function(e){
			$('.fillPreview').hide();
	});
	
	$('.fillPreview').on('mouseup',function(e){
		$(this).hide();
	}).on('mousemove',function(e){
		e.preventDefault();
	});
	
	tm_afterlistcallback = setTimeout(callback,100);
	
	
	
};

var changeCaption = function(item_index,newcaption,callback){
	var new_caption = newcaption;
	var old_caption = "";
	hideDialogue();
	if(new_caption !== "" && new_caption !== null){
		if(!UpToDate(imageDB.items[item_index])){
			//forces new Database style on old depracated objects:
			if(imageDB.items[item_index]!== new_caption)
			{
				old_caption = imageDB.items[item_index];
				if(new_caption !== ""){
					
					// updates object to new style with .caption property:
					imageDB.items[item_index] = {'url':imageDB.items[item_index],'caption':new_caption};
				}
				else{
					// if input was blank, set the caption to URL
					imageDB.items[item_index] = {'url':imageDB.items[item_index],'caption':imageDB.items[item_index]};
				}
				notify("Image caption changed","neutral");
			}
		}
		else{
			if(imageDB.items[item_index].caption !== new_caption)
			{
				old_caption = imageDB.items[item_index].caption;
				if(new_caption !== ""){
					imageDB.items[item_index].caption = new_caption; // uses the new database style with url: & caption:
					
				}
				else{
					imageDB.items[item_index].caption = imageDB.items[item_index].url;
				}
				notify("Image caption changed","neutral");
				
				
			}
		}
		
		// store old caption in _history:
		pushHistoryItem({restoreType:'caption',index:item_index,caption:old_caption});
		applyChanges();
		$('.imageBox[data-item-index="'+item_index+'"]').find('.captionText').html(new_caption);
	}
};