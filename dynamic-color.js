var imageArray;

$(document).ready(function(){
	imageArray = [];
});

var dynamicColorBars = function(){
	var width = $('.column').width();
	var canv = document.getElementById('canvDynamicColor');
	canv.height = '0px';
	
	var totalHeight = 0;
	for(var img in images){
		totalHeight += images[img].height;
	}
	
	canv.width = width;
	canv.height = totalHeight;
	var ctx = canv.getContext('2d');
	ctx.clearRect(0,0,canv.width,canv.height);
	
	var currentHeight = 0;
	for(var img in images){
		try{
			ctx.drawImage(images[img],0,currentHeight,width,500);
			currentHeight+=500;
		}
		catch(error){
			console.log(error);
			continue;
		}
		finally{
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
	
	$('#Super').css('background',rgba);
	$('.collectionFooter').css('background',rgba);
	
	console.log('rgba is ' + rgba);
};

var images = [];
var tm_dynamic = 0;
var pushImageToDynamicColor = function(image){
	clearTimeout(tm_dynamic);
	var img = new Image;
	img.crossOrigin = 'Anonymous';
	img.src = image.src;
	images.push(img);
	console.log('pushed image! '+image.src + ' images is '+images.length+' images long');
	if(images.length === $('.imageBox img').length){
		setTimeout(dynamicColorBars,1000);
	}
	
};