var imageArray;

$(document).ready(function(){
	imageArray = [];
});

var clearThemeCache = function(){
	$(DATABASE.libraries[libraryIndex].collections).each(function(i,item){
		if(typeof item.themeCache !== 'undefined'){
			item.themeCache.sampleSize = 0; // force it to recreate the theme by remove the sampleSize
		}
	});
	applyChanges();
	alert('theme cache cleared');
}

var changeBarColors = function(rgba){
	if(typeof rgba === 'string'){
		$('#Super').css('background',rgba);
		$('.collectionFooter').css('background',rgba);
		imageDB.themeCache.colors.navBars = rgba;
		// set the sampleSize
		imageDB.themeCache.sampleSize = $('.imageBox img').length;
		console.log('color '+rgba+' has been cached');
	}
	else{
		log('the rgba themCache color retrieved was not a string?')
		// if cannot retrieve cached navBars color, just do a neutral color
		imageDB.themeCache.colors.navBars = 'rgba(50,50,50,0.6)';
	}
	
	applyChanges();
	
}

var dynamicColorBars = function(){
	var width = $('.column').width();
	var canv = document.getElementById('canvDynamicColor');
	var images = [];
	$('.imageBox img').each(function(i,item){
		images.push(item);
	});
	canv.height = '0px';
	canv.style.display = 'block';
	canv.style.border = 'solid 1px black';
	
	var blockSize = {width:300,height:300}; // size of blocks to sample from each image
	
	var totalHeight = blockSize.height; //images[img].height;
	
	canv.width = blockSize.width;
	canv.height = blockSize.height;
	var ctx = canv.getContext('2d');
	ctx.clearRect(0,0,canv.width,canv.height);
	
	for(var img in images){
		try{
			ctx.drawImage(images[img]);
			totalHeight+=blockSize.height;
		}
		catch(error){
			continue;
		}
	}
	
	canv.height = totalHeight;
	var ctx = canv.getContext('2d');
	ctx.clearRect(0,0,canv.width,canv.height);
	
	var currentHeight = 0;
	for(var img in images){
		ctx.save(); // save region of entire canvas
		ctx.rect(0,currentHeight,blockSize.width,blockSize.height);
		ctx.clip();
		try{
			ctx.drawImage(images[img],-(images[img].width / 2 - blockSize.width / 2),currentHeight - (images[img].height / 2 - blockSize.height / 2));
		}
		catch(error){
			log(error);
			continue;
		}
		
	}
	
	var imageData = ctx.getImageData(0,0,canv.width,canv.height);
	var data = imageData.data;
	var sum = {r:0,g:0,b:0}; // object to store the sum of all pixel values
	
	// iterate through all pixels in all images and get the sum of all pixel values in r,g,b
	for(var y = 0;y < imageData.height;y++){
		for(var x = 0;x < imageData.width;x++){
			var index = ((imageData.width * y) + x) * 4;
			
				sum.r += data[index];
				sum.g += data[index + 1];
				sum.b += data[index + 2];
		}
	}
	
	console.log('sum.r is ' + sum.r);
	
	// get the average of all pixels
	var color = {
		r: Math.round(sum.r / (imageData.width * imageData.height)),
		g: Math.round(sum.g / (imageData.width * imageData.height)),
		b: Math.round(sum.b / (imageData.width * imageData.height)),
	};
	
	var opacity = 0.6;
	
	// turn it into an rgba string
	var rgba = 'rgba('+color.r+','+color.g+','+color.b+','+opacity+')';
	
	changeBarColors(rgba);
	
	console.log('rgba is ' + rgba);
};

/*
var images = [];
var tm_dynamic = 0;
var pushImageToDynamicColor = function(image){
	clearTimeout(tm_dynamic);
	var img = new Image;
	img.crossOrigin = 'Anonymous';
	img.src = image.src;
	images.push(img);
	console.log('pushed image! '+image.src + ' images is '+images.length+' images long');
	tm_dynamic = setTimeout(function(){
		if(images.length === $('.imageBox img').length){
			dynamicColorBars();
		}
	},500);
	
};

*/