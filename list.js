//DELETE AN IMAGE
var Delete = function(domElement = null){
	
	//alert(selected_index);
		//alert($(this).attr("id"));
		
		//FOR UNDO add item to list of deleted items FOR UNDO:
			var new_deleted = {
					restoreType:"deleted_image",
					index:dbIndex,
					indexOfImage:selected_index,
					imageURL:imageDB[selected_index]
				// value:[which collection,the index of the image in the collection,the src url of the image]
			};
			_history.push(new_deleted);
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
		imageDB.splice(selected_index,1);
		
		applyChanges();
		
		var currentscroll = $(window).scrollTop();
		$(domElement).fadeOut('fast',function(){
			List(false,function(){
				$(document).scrollTop(currentscroll);
			});
		});
		
		notify("Image deleted","warning");
};

var tm_afterlistcallback = 0;
var List = function(load_animation = false,callback){
	// Populate images
	clearTimeout(tm_afterlistcallback);

	$("#imageList").html("");
	
	// refresh images array for dynamicColorBars
	images = [];
	
	
	// generate the columns for laying out the images
	for(var i=0;i < no_of_columns;i++){
			$('#imageList').append('<div class="column" id="col'+i+'"></div>');
	}
	
	var current_column = 0; // the column to populate. iterate through the four
	for(var i = imageDB.length - 1;i > -1;i--){			
		
		var element = processURL(i);
		// Finally, LAYOUT the images and videos in the view // 
		// Give image and corresponding controls the same id for easy access:
		$("#imageList").children().eq(current_column).append("<div class='imageBox' id='box"+i+"' style='display:"+(load_animation ? 'none' : 'block')+"' >"
		+ element // the image or video
		+ /*delete button*/ "<button class='btnDelete' id='delete"+i+"'>x</button>"
		+"<div class='caption'><span class='captionText'>" + processCaption(imageDB[i])+"</span>"
		+"<button class='btnEditCaption'>&#128393;</button></div>" // add edit button to image caption
		+"</div>"); // end the imageBox div
		
		
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
	
	
	$('#imageList video').on('loadeddata',function(){
		$(this).parent().fadeIn(1000);
		if (typeof this.webkitAudioDecodedByteCount !== "undefined") {
			// non-zero if video has audio track
			if (this.webkitAudioDecodedByteCount > 0){
				var thisId = this.getAttribute('id');
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

	$('.imageBox img').on('load',function(){
			$(this).parent().fadeIn(500);
			//pushImageToDynamicColor(this);
		}).on('error',function(){
			$(this).parent().show();
			$(this).addClass('loadError').height(250)
			.parent().children('.caption').addClass('loadError').html('Error loading image');
			$(this).parent().children('.btnDelete').addClass('loadError');
			
			
			notify("Some images could not be loaded.",'warning');
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
		selected_index = parseInt($(this).attr("id").replace("delete",""));
		Delete($(this).parent());
	});
	
	// show the Caption editor
	var editImageCaption = function(element){
		$(element).children('.captionText').hide();
		$(element).prepend('<textarea class="txtEditCaption"/>');
		
		$('.txtEditCaption').val(getCaption(imageDB[selected_index])) // put in the old caption
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
		selected_index = parseInt($(this).closest('.imageBox').attr("id").replace("box","")); // gets the image's index for editing
		editImageCaption($(this).parent().get(0));
	});
	
	//DOUBLE CLICK IMAGE binds -- fullscreen 
	$("img").bind("dblclick",function(e){
		e.preventDefault();
		selected_index = parseInt($(this).attr("id")); // this is so we can display a notification
		fullscreenImage(this);
	});
	$("video").bind("dblclick",function(e){
		e.preventDefault();
		selected_index = parseInt($(this).attr("id"));
		fullscreenVideo(this);			
	});
	
	tm_afterlistcallback = setTimeout(callback,100);
	
	
	
};

var changeCaption = function(item_index,newcaption,callback){
	var new_caption = newcaption;
	var old_caption = "";
	hideDialogue();
	if(new_caption !== "" && new_caption !== null){
		if(!UpToDate(imageDB[item_index])){
			//forces new Database style on old depracated objects:
			if(imageDB[item_index]!== new_caption)
			{
				old_caption = imageDB[item_index];
				if(new_caption !== ""){
					
					// updates object to new style with .caption property:
					imageDB[item_index] = {'url':imageDB[item_index],'caption':new_caption};
				}
				else{
					// if input was blank, set the caption to URL
					imageDB[item_index] = {'url':imageDB[item_index],'caption':imageDB[item_index]};
				}
				notify("Image caption changed","neutral");
			}
		}
		else{
			if(imageDB[item_index].caption !== new_caption)
			{
				old_caption = imageDB[item_index].caption;
				if(new_caption !== ""){
					imageDB[item_index].caption = new_caption; // uses the new database style with url: & caption:
					
				}
				else{
					imageDB[item_index].caption = imageDB[item_index].url;
				}
				notify("Image caption changed","neutral");
			}
		}
		
		// store old caption in _history:
		_history.push({restoreType:'caption',index:item_index,caption:old_caption});
		
		applyChanges();
		$('#box'+item_index).find('.captionText').html(new_caption);
	}
};