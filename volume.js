// MuteAll Video Elements

var muted = true;

var muteAll = function(){
	
	$('video').prop("muted",true);
	$('.btnUnmute').removeClass("soundOn");
};

var Unmute = function(element){
	if($(element).is('video')){
		element.muted = false;
		$(element).parent().children('.btnUnmute').addClass('soundOn');
	}
	else{
		console.log("Can't unmute. Not a video.");
	}
	
};

// change volume icon based on muted or not
var toggleMuteIcon = function(){
	if(muted === true){
		$('#imgVolumeIcon').attr('src','mute_icon.png');
	}
	else{
		$('#imgVolumeIcon').attr('src','volume_icon.png');
	}
}

// check if all videos are muted, change volume icon accordingly
var checkMuted = function(){
	muted = true;
	var soundon = 0;
	$('video').each(function(i,item){
		if(item.muted==false){
			soundon+=1;
		}
	});
	if(soundon > 0){
		muted = false;
	}
	
	toggleMuteIcon();
	
	return muted;
}

// change all video volumes to match global
var updateVolumes = function(newvolume){
	
	$('video').prop('volume',global_volume);
};

var tmHideVolume = 0;	
var volumeJumpFactor = 0.10;

var volumeSlide = function(amount){
	var volSlider = $('#fsVolumeSliderContainer');
	var volumeToHeightFactor = 300; // for converting the decimal volume to a CSS height
	
	
	var thisvideo = $('#FullScreenView video');
	var newVolume = Math.floor((global_volume+amount)*100) / 100; // rounds the number then returns it to 0.0x
	if(newVolume <= 1 && newVolume >= 0){
		global_volume = newVolume; // change the global volume for videos
		updateVolumes();
	}
	clearTimeout(tmHideVolume);
	
	/*
		console.log('fullscreen volume');
		volSlider.stop(true,true).hide().show()
		.height(volumeToHeightFactor)
		.children().height(global_volume * volumeToHeightFactor); // show the volume bar with the correct height
		tmHideVolume = setTimeout(function(){
			volSlider.fadeOut(500)
		},1000);
	*/
	
		var volumeDialog = $('#volumeSliderDialogContainer');
		volumeDialog.stop(true,true);
		volumeDialog.hide();
		volumeDialog.show();
		var slider = $('#volumeSlider');
	
	if(!checkMuted()){
		// turn the volume into a proportion of the container width:
		slider.width(global_volume * $('#volumeSliderContainer').width());
	}
	else{
		slider.width(0);
	}
		tmHideVolume = setTimeout(function(){
			volumeDialog.fadeOut(500)
		},700);
	
};

$(document).ready(function(){
	var container = $('#volumeSliderDialogContainer');
	var dialog = $('#volumeSliderDialog');
	dialog.css('left',((window.innerWidth - 50) / 2 - dialog.width() / 2));
	container.hide();
	$(window).on('keydown',function(e){
		checkMuted();
		// UP (volume
		if(e.which==38 && e.shiftKey){
			e.preventDefault();
			volumeSlide(volumeJumpFactor);
		}
		// DOWN VOLUME
		else if(e.which==40 && e.shiftKey){
			e.preventDefault();
			volumeSlide(-volumeJumpFactor);
		}
	});
});