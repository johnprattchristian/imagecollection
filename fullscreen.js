// removes video and img elements in the fullscreenView parent element, so as to retain the #fullscreenNotifications
var removeFullScreenChildren = function(){
	$('#FullScreenView').css({backgroundImage:'none'});
	$('#FullScreenView video').remove();
	$('#FullScreenView img').remove();
};

var fullscreenHelpTip = function(){
	
}

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

var oldParentOfFullscreenVideo = null;

var fullscreenVideo = function(vid){
	currentFSElement = vid; // this is just to initiate the currentFSElement
	var fsParent = $('#FullScreenView');
	var vidClone = $(vid).clone(true,false);
	vidClone
	.prop('volume',0.5)
	.prop('muted',false)
	.prop('currentTime',0)
	.attr('id',''); // remove the duplicate id
	
	removeFullScreenChildren(); // resets FullscreenView
	vidClone.appendTo(fsParent).get(0).play(); // appends and begins playing the new Fullscreen video
	
	
	
	if (!window.screenTop && !window.screenY) {			  
		
		goFullscreen();
		
		if(getSetting('fullscreenCaptions')){
			notify(imageDB[selected_index].caption);
		}
	}
};
	
var IterateSlideshow = function(direction){
			removeFullScreenChildren();
			var nextElemId = parseInt(currentFSElement.getAttribute("id"))-direction; // the id of the element to switch to
			var element = null;
			
			
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
var jumpToElementByScrollPosition = function(element_to_jump_to){
	// make the documents scroll position (scrollTop) equal to an elements position
	$(document).scrollTop($(element_to_jump_to).offset().top - 100);
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

$(document).ready(function(){
	$(document).bind("exitFullscreen msExitFullscreen mozCancelFullScreen webkitExitFullscreen",currentFSfalse());
	$(document).on("fullscreenchange mozfullscreenchange msfullscreenchange webkitfullscreenchange",function(){
			if($("#FullScreenView").css("visibility")=="visible"){
				$("#FullScreenView").css("visibility","hidden");
			 // clears everything inside the fullScreenView object
				// jumps to the last slideshow-ed image outside of full screen view:
				// jumpToElementById(currentFSElement); NO LONGER RELEVANT
				
				notifs.hide();
				
				if(currentFSElement){
					jumpToElementByScrollPosition(currentFSElement);
				}
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
	//RIGHT ARROW KEY DOWN (fullscreen)
		if(e.which==39){
			IterateSlideshow(1);
		}
	//LEFT ARROW
		else if(e.which==37){
			IterateSlideshow(-1);
		}
		else if(e.which==27){
			
			setTimeout(function(){
				$("#FullScreenView").css("visibility","hidden");
			},100)
		}
	});
	
	$('#btnExitFullscreen').click(function(){
		exitFullScreen();		
	});
});
		