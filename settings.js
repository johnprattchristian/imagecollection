// user settings:
var _settings;

var saveSettings = function(){
	localStorage.setItem("user_settings",JSON.stringify(_settings));
}

var initializeSettings = function(){
	_settings = JSON.parse(localStorage.getItem("user_settings"));
	if(_settings === null || _settings === {}){
		_settings = [
			{item:'fullscreenCaptions',value:true,label:'Fullscreen Notifications'},
			{item:'notificationColors',value:true,label:'Notification Colors'}
		]
		saveSettings();
	}
}

$(document).ready(function(){
	initializeSettings();
});

// Retrieve a setting object by 'item' property (the name) from the _settings arrays for use
var getSetting = function(setting){
	// retrieve the first item from an array of settings that match the given name
	return $.grep(_settings,function(e){return e.item === setting})[0];
};

var settingChanged = function(element){
	var $element = $(element);
	if($element.is(":checkbox")){
		console.log('its a checkbox');
		var setting = getSetting($element.prop('value'));
		if($element.is(":checked")){
			// find the setting for the given checkbox and match the setting to whether or not its checked:
			setting.value = true;
			
		}
		else{
			setting.value = false;
		}
		console.log(setting.value);
	}
	
	saveSettings();
};

var settingsDialogue = function(){
	var dialog = $('#d_Settings');
	var settingsDiv = $('#d_Settings #settingsContainer');
	
	settingsDiv.html("");
	$(_settings).each(function(i,item){
		
		var settingItem = null;
		var evalItem = item.value;
		
		switch(typeof evalItem){
			case 'boolean':
				settingItem = $("<label><input type='checkbox' value='"+item.item+"'" +
				""+
				(item.value === true ? 'checked' : '') + ">"+item.label+"</label></input>");
				
				break;
			default:
				console.log('could not evaluate setting ' + item.item);
				break;
		}
		
		console.log(settingItem);
		settingsDiv.append(settingItem);
		settingsDiv.append('<br>');
	});
	
	$(':checkbox').change(function(){
		settingChanged(this);
	});
	
	
};