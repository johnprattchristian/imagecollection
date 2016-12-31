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
		
		// changeable styling
		getSetting('roundedCorners') ? newBox.addClass('rounded') : false;
		
		// appendings for only images and videos
		if(item.type==='image' || item.type ==='video' || item.type === 'youtube'){
			var element = processURL(i);
			// create the spinner loader
			var loading_img = $('<div class="loading-animation"><div class="loading-circle red"></div><div class="loading-circle green"></div><div class="loading-circle blue"></div></div>');
			
			// create the caption UI
			var caption = "<div class='caption imageBoxUI'><span class='captionText'>" + processCaption(imageDB.items[i])
			+"</span><span class='btnEditCaption faded edit-button'></span></div>"; // add edit button to image caption
			// append the caption UI
			newBox.append(element).append(caption);
			// append the copy URL button
			newBox.append('<div class="btnCopyURL imageBoxUI" data-clipboard-text="'+getURL(item)+'"></div>');
			// if it's not a GIF, append the loader thingy
			var testGIF = myRegex['gif'].test(getURL(item));
			if(myRegex['gif'].test(getURL(item))===false){
				$(element).css('opacity',0.4);
				newBox.append(loading_img);
			}
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
		newBox.append("<button class='btnDelete imageBoxUI' data-item-index='"+i+"'>x</button>");
		
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

	// video binds
	var videoMediaItem = $('#imageList video.media-item');
	videoMediaItem.css('opacity',0.4);
	// append play icon
	videoMediaItem.on('loadeddata',function(){
		$(this).parent().height($(this).parent().height()-5);
		
		// remove loading icon
		$(this).siblings('.loading-animation').remove();
		
		// append play icon
		var playIcon = $('<div class="play-icon" onclick="$(this).hide()"></div>');
		playIcon.on('click',function(){
			var vid = $(this).siblings('video').get(0);
			if(vid.paused){
				$('video.media-item').each(function(){
					this.pause();
				});
				vid.play()
			}else{vid.pause()}
		});
		$(this).parent().append(playIcon);
		if($(this).height()<$(this).width()){
			playIcon.css('top','-='+$(this).siblings('.caption').height());
		}
		
		$(this).css('opacity',1);
		
		// if loaded properly, do stuff
		if (typeof this.webkitAudioDecodedByteCount !== "undefined") {
			// non-zero if video has audio track
			if (this.webkitAudioDecodedByteCount > 0){
				var thisId = this.dataset.index;
				// create unmute button:
				var unmuteButton = $('<div class="btnUnmute imageBoxUI" data-index="'+thisId+'"></div>')
				.on('click',function(){
					var video = $('video.media-item[data-index="'+thisId+'"]').get(0);
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
		// create an 'Error' imageBox
		$(this).parent().show();
		$(this).css('border','solid 2px red').parent().children('.btnDelete').css('borderColor','rgba(255,0,0,0.7)');
		notify("Some images could not be loaded.",'warning');
	})
	.on('click',function(e){
		// play video and pause all others on page
		var vid = $(this).get(0);
		if(vid.paused){
			$('video.media-item').each(function(){
				this.pause();
			});
			vid.play()
		}else{vid.pause()}
	})
	.on('pause',function(){
		$(this).siblings('.play-icon').show();
	}).on('play',function(){
		$(this).siblings('.play-icon').hide();
		// unmute on first play
		if(this.currentTime < 1){
			Unmute(this);
		}
	});
	
	// unmute the previously unmuted video if any
	if(audio_playing_index>=0){
		var unmuteVideo = document.getElementById(audio_playing_index);
		$(unmuteVideo).prop('muted',false);
	}
	
	// image binds
	$('.imageBox img.media-item').on('load',function(){
			$(this).parent().height($(this).height());
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

	$('.imageBoxUI').hide();
	// mouseenter / mouseleave imageBox binds for fading captions
	$('.imageBox').bind('mousemove',function(e){
			$(this).children('.imageBoxUI').show();
	});
	
	$('.imageBox').bind('mouseleave',function(e){
		if($(this).has('.txtEditCaption').length === 0){
			$(this).children('.imageBoxUI').fadeOut(100);
		}
	});
	
	var copyURLbuttons = new Clipboard('.btnCopyURL');

	copyURLbuttons.on('success', function(e) {
		console.info('Copied: ',e.text);
		e.clearSelection();
	});
	
	$('.btnCopyURL').bind('click',function(){
		selected_index = parseInt($(this).parent().attr('data-item-index'));
		
		notify(' Copied URL to clipboard');
	});

	// bind delete buttons events
	$(".btnDelete").bind("click",function(){
		selected_index = parseInt($(this).attr("data-item-index"));
		Delete($(this).parent());
	});
	
	// show the Caption editor
	var editImageCaption = function(element){
		$(element).children('.captionText,.btnEditCaption').hide();
		$(element).prepend('<textarea class="txtEditCaption"/>');
		
		$('.txtEditCaption').val(getCaption(imageDB.items[selected_index])) // put in the old caption
		.on('keydown',function(e){
			if(!e.shiftKey && e.which == 13){
				e.preventDefault();
				changeCaption(selected_index,$(this).val()); // change image caption to whatever's in the textarea
			$(element).children('.captionText,.btnEditCaption').show();
			$(element).children('.txtEditCaption').remove();
			}
		}).on('blur',function(){
			changeCaption(selected_index,$(this).val()); // change image caption to whatever's in the textarea
			$(element).children('.captionText,.btnEditCaption').show();
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
	
	var fillPreviewOpacity = 0.6;
	$('img.media-item').bind('contextmenu',function(e){
		e.preventDefault();
	})
	.on('mousedown',function(e){
		if(e.which===3){
			var quickPreview = getSetting('quickPreview');
			if(getSetting('quickPreview')===true){
					var fillPreview = $('.fillPreview');
				fillPreview.css({
					background:'url("'+$(this).attr('src')+'") no-repeat center ',
					backgroundColor:'rgba(0,0,0,'+fillPreviewOpacity+')',
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
		if(typeof imageDB.items[item_index] !== 'object'){
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
			// if the caption isn't the same as before...
			if(imageDB.items[item_index].caption !== new_caption)
			{
				// set old caption to current caption
				old_caption = imageDB.items[item_index].caption;
				// if the new caption isn't blank...
				if(new_caption !== ""){
					// the new caption is 'new_caption'
					imageDB.items[item_index].caption = new_caption; // uses the new database style with url: & caption:
					
				}
				else{
					// otherwise the caption becomes the URL
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