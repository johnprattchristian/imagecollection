// jumps to an element on the page purely by scrolling to its position
var jumpToElementByScrollPosition = function(element_to_jump_to,animation_speed,callback){
	// make the documents scroll position (scrollTop) equal to an elements position
	if(animation_speed !== null && animation_speed !== false && typeof animation_speed !== 'undefined' && animation_speed > 0){
		$('body').animate({scrollTop:$(element_to_jump_to).offset().top-100},animation_speed,callback ? callback : undefined);
		log('animated scroll!');
	}
	else{
		$(document).scrollTop($(element_to_jump_to).offset().top - 100);
	}
	
};

// 
var tmStartAnimation = 0;
var zoomOutSlideshow = function(element,bigversion){
	//clearTimeout(tmHideHighlight);
	var highlight = $('#highlight');
	var $element = $(element);
	var speed = 200;
	
	$element.parent().css('visibility','hidden');
	clearTimeout(tmStartAnimation);
	tmStartAnimation = setTimeout(function(){
		// clone the image so we can animate it
		var $elementClone = $element.clone(false);
		$elementClone.off()
		// set starting properties
		.css({
			height:'100%',
			width:'auto',
			position:'relative',
			visibility:'visible'
		}).appendTo(highlight);
	
		if($element.is('img')){
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
				},speed,function(){
					highlight.hide().children().remove(); // hide the "highlight" element and delete the image on it
					$element.parent().css('visibility','visible'); // makes it so controls only appear after animation
				});
			});
		}
		else if($element.is('video')){
			
			highlight.children().on('loadeddata',function(){
			this.currentTime = element.currentTime;
			highlight.children().on('seeked',function(){
					
					var animatePos = {
						width:$element.parent().width(),
						height:$element.parent().height(),
						top:$element.parent().offset().top,
						left:$element.parent().offset().left
					};
					highlight.stop(true,true)
					.animate({
							width:animatePos.width,
							height:animatePos.height,
							top:animatePos.top,
							left:animatePos.left
					},400,function(){
						highlight.hide().children().remove();
						$element.parent().css('visibility','visible'); // makes it so controls only appear after animation
					});
				});
			});
		}
		// set the default state of highlight BEFORE animation:
		highlight.css({
			width:window.innerWidth,
			height:window.innerHeight,
			top:$(document).scrollTop(),
			left:'0px',
			backgroundColor:('rgba(0,0,0,0)')
		//wrap it in <center> for easy centering:
		}).wrap('<center/>').show();
	},0);
};

var tm_highlightFadeOut = 0;
var highlightRestore = function(element){
	var highlight = $('#highlight');
	var speed = 200;
	
	clearTimeout(tm_highlightFadeOut);
	highlight.stop(true,true).hide().css({
		backgroundColor:'rgba(20,200,10,0.5)',
		position:'absolute',
		top:$(element).offset().top,
		left:$(element).offset().left,
		width:$(element).width(),
		height:$(element).height()
	});
	
	highlight.fadeIn(speed,function(){
		tm_highlightFadeOut = setTimeout(function(){
			highlight.fadeOut(speed);
		},0);
	});
};


// Scroll back to top
var scrollToTop = function(callback){
	var currentScrollTop = $('body').scrollTop();
	var factor = currentScrollTop / $('body').height();
	$('body').animate({scrollTop:0},500 * factor,callback); //increase speed (decrease ms) based on how far down the page we are
};