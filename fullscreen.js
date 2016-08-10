var iterating = false; // decide if iterating the slideshow or just jumping into fullscreen

// function to test if fullscreen
var Fullscreen = function(){
	if(window.innerHeight == screen.height && window.innerWidth == screen.width){
		return true;
	}
	else{
		return false;
	}
}

// removes video and img elements in the fullscreenView parent element, so as to retain the #fullscreenNotifications
var removeFullScreenChildren = function(){
	$('#FullScreenView').css({backgroundImage:'none'});
	$('#FullScreenView video').remove();
	$('#FullScreenView img').remove();
};

var goFullscreen = function(){
	var element = document.getElementById('FullScreenView');
	if(element.requestFullscreen) {
		element.requestFullscreen();
	  } else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	  } else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	  } else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	  }
	  
	
};
	
var fullscreenImage = function(img){
	currentFSElement = img; // this is for other functions to know on the first time using currentFSElement
	removeFullScreenChildren();
	var element = document.getElementById("FullScreenView");
	//element.style.visibility="visible";
	element.style.backgroundImage='url('+img.getAttribute("src")+')';
	$(element).css("background-color","rgba(100,100,100,0.4");
	if (!window.screenTop && !window.screenY) { // not already fullscreen, right?
	
		goFullscreen();
		
		if(getSetting('fullscreenCaptions') === true){
			notify(imageDB[selected_index].caption);
		}
		
	}
};

var fullscreenVideo = function(vid){
	currentFSElement = vid; // this is just to initiate the currentFSElement
	muteAll(); // mute any videos playing outside of fullscreen
	var fsParent = $('#FullScreenView');
	var vidClone = $(vid).clone(true,false);
	vidClone.off()
	.prop('currentTime',0)
	.attr('id','') // remove the duplicate id'
	.prop('muted',false)
	.prop('volume',global_volume)
	removeFullScreenChildren(); // resets FullscreenView
	vidClone.appendTo(fsParent).get(0).play(); // appends and begins playing the new Fullscreen video

	if(!iterating){ // if just jumping into fullscreen, match the playhead with the smaller version of the video
		matchVideoCurrentTimes(true);
	}

	if (!window.screenTop && !window.screenY) {			  
		
		goFullscreen();
		if(getSetting('fullscreenCaptions').value){
			notify(imageDB[selected_index].caption);
		}
	}
	
	checkMuted();
};


var IterateSlideshow = function(direction){
		removeFullScreenChildren(); // get rid of whatever videos/images are already in the fsview
		var nextElemId = parseInt(currentFSElement.getAttribute("id"))-direction; // the id of the element to switch to
		var element = null;
		iterating = true;
		
		if (direction>0){
			if(nextElemId > -1){ // if not reached the end of the collection, proceed (direction increment correlates with id decrement)
				element = document.getElementById((parseInt(currentFSElement.getAttribute("id"))-1).toString());
			}
			else{ // we've reached the end of the collection:
				element = document.getElementById((imageDB.length-1).toString()); // go back to the beginning of the collection
			}
		}else{
			if(nextElemId<=imageDB.length-1){ // does not exceed the collection length
				element = document.getElementById((parseInt(currentFSElement.getAttribute("id"))+1).toString());
			}
			else{ // go back to the end of collection
				element = document.getElementById("0");
			}
		}
		// Decide what to do whether image is an IMG or a VIDEO
		currentFSElement = element;
		if($(element).is('img')){
			fullscreenImage(currentFSElement);
		}
		else if($(element).is('video')){ // video 
			fullscreenVideo(currentFSElement);
			
		}
		
		var newid = parseInt(currentFSElement.getAttribute('id'));
		if(getSetting('fullscreenCaptions')){
			notify(imageDB[newid].caption ? imageDB[newid].caption : imageDB[newid]);
		}
		
};

var currentFSfalse = function(){
		//alert("got fullscreen request")
		currentFSElement = false;
		$("#FullScreenView").css("visibility","hidden");
};
	
// jumps to an element on the page purely by scrolling to its position
var jumpToElementByScrollPosition = function(element_to_jump_to,whatToDoWhenDone){
	// make the documents scroll position (scrollTop) equal to an elements position
	$(document).scrollTop($(element_to_jump_to).offset().top - 100);
	
	setTimeout(function(){
		if(typeof whatToDoWhenDone != 'undefined'){
			whatToDoWhenDone();
		}
	},100);
};

var exitFullScreen = function()
{
    if (document.exitFullscreen)
        document.exitFullscreen();
    else if (document.msExitFullscreen)
        document.msExitFullscreen();
    else if (document.mozCancelFullScreen)
        document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen)
        document.webkitExitFullscreen();
};

var matchVideoCurrentTimes = function(goingFullscreen){
	if(goingFullscreen){ // from fullscreen video to smaller one
		$('#FullScreenView video').prop('currentTime',currentFSElement.currentTime);
	}
	else{ // transfer current time from fullscreen one to small one
		currentFSElement.currentTime = $('#FullScreenView video').prop('currentTime');
	}
};

var tmStartAnimation = 0;
var highlightElement = function(element,bigversion){
	//clearTimeout(tmHideHighlight);
	var type = 'img';
	var highlight = $('#highlight');
	var $element = $(element);
	if($element.is('video')){
		type = 'video';
	}
	clearTimeout(tmStartAnimation);
	tmStartAnimation = setTimeout(function(){
			// clone the element into the highlight animation div
			$element.clone(false)
			.off()
			.css({
				height:'100%',
				width:'auto',
				position:'relative'
			}).appendTo(highlight);
			// set the default state of highlight BEFORE animation:
			highlight.css({
				width:window.innerWidth,
				height:window.innerHeight,
				top:$(document).scrollTop(),
				left:'0px',
				backgroundColor:('rgba(0,0,0,0)')
			//wrap it in <center> for easy centering:
			}).wrap('<center/>').show();
		if(highlight.children().eq(0).is('img')){
				highlight.children().on('load',function(){
					// the position / size to animate TO:
					var animatePos = {
						width:$element.parent().width(),
						height:$element.parent().height(),
						top:$element.parent().offset().top,
						left:$element.parent().offset().left
					}
					highlight.stop(true,true) // stop any currently playing animations
					.animate({
							width:animatePos.width,
							height:animatePos.height,
							top:animatePos.top,
							left:animatePos.left
					},400,function(){
						highlight.hide().children().remove(); // hide the "highlight" element and delete the image on it
					});
				});
		}
		else {
				
					var animatePos = {
						width:$element.parent().width(),
						height:$element.parent().height(),
						top:$element.parent().offset().top,
						left:$element.parent().offset().left
					}
					highlight.stop(true,true)
					.animate({
							width:animatePos.width,
							height:animatePos.height,
							top:animatePos.top,
							left:animatePos.left
					},200,function(){
						highlight.hide().children().remove();
					});
		}
	},10);
	// Wait, and then fadeOut and remove() the highlight element
	//tmHideHighlight = setTimeout(function(){highlight.fadeOut('slow',function(){highlight.remove()})},100); 
};


$(document).ready(function(){
	$(document).bind("exitFullscreen msExitFullscreen mozCancelFullScreen webkitExitFullscreen",currentFSfalse());
	$(document).on("fullscreenchange mozfullscreenchange msfullscreenchange webkitfullscreenchange",function(){
			if($("#FullScreenView").css("visibility")=="visible"){
				$("#FullScreenView").css("visibility","hidden");
			 // clears everything inside the fullScreenView object
				// jumps to the last slideshow-ed image outside of full screen view:
				// jumpToElementById(currentFSElement); NO LONGER RELEVANT
				
				notifs.hide();
				iterating = false; // reset this variable
				if('#FullScreenView video'){
					matchVideoCurrentTimes(false);
					Unmute(currentFSElement);
				}
				
				removeFullScreenChildren(); // clear the fullscreen parent
				jumpToElementByScrollPosition(currentFSElement,highlightElement(currentFSElement));
				
			}
			else{
				$("#FullScreenView").css("visibility","visible");
			}

	});

	//Fullscreen click events
	$('#FullScreenView')
		.on('click',function(e){
			if(e.which===1){
				IterateSlideshow(1);
			}
			else if(e.which===3){
				IterateSlideshow(-1);
			}
			else if(e.which===2){
				
				alert("middle button!");
				if(document.webkitExitFullscreen){
					e.preventDefault();
					document.webkitExitFullscreen();
				}
			}
		})
		.on('contextmenu',function(e){ // 'contextmenu' is just right click basically
			e.preventDefault();
			IterateSlideshow(-1);
		});
	
	// SLIDESHOW ARROW KEY EVENTS
	$(window).on("keydown",function(e){
		
		// Fullscreen only
		if(Fullscreen){
			
			//RIGHT ARROW KEY DOWN (fullscreen)
			if(e.which==39 && !e.shiftKey){
				IterateSlideshow(1);
			}
			//LEFT ARROW
			else if(e.which==37 && !e.shiftKey){
				IterateSlideshow(-1);
			}
			//ESC
			else if(e.which==27){
				
				setTimeout(function(){
					$("#FullScreenView").css("visibility","hidden");
				},100)
			}

		}
		
		// works globally
			
	});
	
	$('#btnExitFullscreen').click(function(){
		exitFullScreen();		
	});
});
		