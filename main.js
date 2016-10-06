var $ = jQuery.noConflict();
// Settings and Variables
var bgRunning = false;
var bgTimer;
var menuTimer;
var subMenuTimer;
var pageLoading=false;
var myAudio;
var btnSound;
var animateMenuPosition = true;
var muteAudioChangedBy = '';
var muteAudioChangedStatus = '';
var showBgCaption = true;
var bgImagesMove = false;
var bgImagesInProsses = false;
var useFullImage = false;
var useFitMode = false;
var ytplayer; 
var ytPlayerReady = false;
var tempbgPaused;
var tempThumbs='';
var tempActive='';
var firstPage = true;
var mobileDevice = false;
var menuMobileOpened = true;


function fixViewportHeight(){
	$('#body-wrapper').height(window.innerHeight);
	if (document.body.scrollTop !== 0) {
      window.scrollTo(0, 0);
    }
}




jQuery.fn.extend({
	contentPageReady: function (fn) {
		if (fn) {
			return jQuery.event.add(document, "contentPageReady", fn, null);
		} else {
			var ret = jQuery.event.trigger("contentPageReady", null, document, false, null);
			if (ret === undefined)
				ret = true;
			return ret;
		}
	}
});

jQuery.fn.extend({
	contentPageAniOnComplate: function (fn) {
		if (fn) {
			return jQuery.event.add(document, "contentPageAniOnComplate", fn, null);
		} else {
			var ret = jQuery.event.trigger("contentPageAniOnComplate", null, document, false, null);
			if (ret === undefined)
				ret = true;
			return ret;
		}
	}
});

function setHistoryLinks(targets){
	for(var i=0; i<targets.length; i++){
		$(targets[i]+' a[target!="_blank"]:not(.modalimage,.nolink)').each(function(){
			$(this).click(function(event){
				event.preventDefault();
				openPage($(this).attr('href'), true);
			});
		});
	}
}

// Init after Loaded
$(window).bind('load', init);
function init(){
	// inner page dynamic adjustment 
	if( navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) || navigator.userAgent.match(/iPhone;.*CPU.*OS 7_\d/i)){
		window.addEventListener("scroll", fixViewportHeight, false);
		window.addEventListener("orientationchange", fixViewportHeight, false);
		$('body').hammer({prevent_default:false}).on("tap", function(e){
			if(window.innerHeight != $('#body-wrapper').height()){
				fixViewportHeight();
			}
		});
	}

	$('#mainmenu span.original').each(function(){
		$(this).parent().append($(this).clone().removeClass('original').addClass('front'));
		$(this).parent().append($(this).clone().removeClass('original').addClass('back'));
	});
	if(navigator.userAgent.indexOf('MSIE 9.0') > 0 || navigator.userAgent.indexOf('MSIE 8.0')>0){
		// menu hack for ie8 - ie9
		$('#mainmenu ul ul, #mainmenu .back, #mainmenu ul ul ul').css('top', '0px');
	}
	$.Isotope.prototype._getMasonryGutterColumns = function() {
		var gutter = this.options.masonry && this.options.masonry.gutterWidth || 0;
		containerWidth = this.element.width();
		 
		this.masonry.columnWidth = this.options.masonry && this.options.masonry.columnWidth ||
		// Or use the size of the first item
		this.$filteredAtoms.outerWidth(true) ||
		// If there's no items, use size of container
		containerWidth;
		 
		this.masonry.columnWidth += gutter;
		this.masonry.cols = Math.floor((containerWidth + gutter) / this.masonry.columnWidth);
		this.masonry.cols = Math.max(this.masonry.cols, 1);
	};
	 
	$.Isotope.prototype._masonryReset = function() {
		// Layout-specific props
		this.masonry = {};
		// FIXME shouldn't have to call this again
		this._getMasonryGutterColumns();
		var i = this.masonry.cols;
		this.masonry.colYs = [];
		while (i--) {
		this.masonry.colYs.push(0);
		}
	};
	 
	$.Isotope.prototype._masonryResizeChanged = function() {
		var prevSegments = this.masonry.cols;
		// Update cols/rows
		this._getMasonryGutterColumns();
		// Return if updated cols/rows is not equal to previous
		return (this.masonry.cols !== prevSegments);
	};
	
	 // modified Isotope methods for gutters in fitRows
	Number.prototype.roundTo = function(num) {
		var resto = this%num;
		if (resto <= (num/2)) { 
			return this-resto;
		} else {
			return this+num-resto;
		}
	}

   $.Isotope.prototype._fitRowsLayout = function($elems) {
		var instance = this,
			containerWidth = this.element.width(),
			props = this.fitRows;

		var gutter = this.options.fitRows && this.options.fitRows.gutterWidth || 0;
		var columnWidth = this.options.fitRows && this.options.fitRows.columnWidth ||
					  // or use the size of the first item
					  this.$filteredAtoms.outerWidth(true) ||
					  // if there's no items, use size of container
					  containerWidth;
		  $elems.each( function() {
			var $this = $(this),
				atomW = $this.outerWidth(true),
				atomH = $this.outerHeight(true);


		if(props.x !== 0 && props.x + atomW + gutter <= containerWidth){
			props.x = props.x.roundTo(columnWidth + gutter);
		}

			if ( props.x !== 0 && atomW + props.x > containerWidth ) {
			  // if this element cannot fit in the current row
			  props.x = 0;
			  props.y = props.height;
			}

			// position the atom
			instance._pushPosition( $this, props.x, props.y );

			props.height = Math.max( props.y + atomH, props.height );
			props.x += atomW;

		});

	};
	
	mobileDevice = Modernizr.touch;
	//mobileDevice = true;

	if($.browser.msie && parseFloat($.browser.version) <= 7){
		$('#loading').html('Sorry, your browser is too old to display this new generation HTML5 web site :(');
		return false;
	}
	
	if(mobileDevice){
		$('#bgText').hide();
		$('.bgTextToggle').css('display','block');
		$('.bgTextToggle').hammer({prevent_default:true}).on("tap", bgTextToggle);
	}
	function bgTextToggle(e){
		if($('#bgText').is(':hidden'))
			$('#bgText').css({opacity:0}).show().animate({opacity:1}, 500);
		else
			$('#bgText').css({opacity:1}).animate({opacity:0}, 500, function(){ $(this).hide(); });
	}
	
	$('#menu-mobile-opener').click(function(){
		menuMobileOpened = true;
	});
	
	$('#menu-mobile-closer').click(function(){
		menuMobileOpened = false;
	});
	
	if(mobileDevice){
		$('.nextBG, .prevBG').hide();
		
		$('#bgPattern, #bgPlayer').hammer({prevent_default:true}).on("swipeleft", function(event) {
			nextBg();
		});
		
		$('#bgPattern, #bgPlayer').hammer({prevent_default:true}).on("swiperight", function(event) {
			prevBg();
		});
	}
	
	if(mobileDevice && $('#menu-container').offset().left<=-230){
		$('#menu-container').addClass('stayClose');
	}
	
	if(twitterEnable) loadTweets();
	
	// Set deeplink
	var firstpopstate = true;
	if(!Modernizr.history || !historyApiEnable){
		$.history.init(openPage);
	}else if(Modernizr.history && historyApiEnable){
		setHistoryLinks(new Array('#menu-container', '#content'));
		window.onpopstate = function(event) {
			if($.browser.webkit && firstpopstate){
				firstpopstate = false;
				return false;
			}
			openPage(document.location.href, false);
			firstpopstate = false;
		};
		openPage('', false);
	}else{
		openPage('', false);
	}
	
	// Dedect browser
	if(!Modernizr.audio)
		$('.footerAudioControls').hide();

	$(window).sresize(function() {
		doSize();
		subMenuDoClose($('ul.menu'));
	});
	$(window).bind('scroll', function() {
		doSize();
	});
	if(mobileDevice){
		if($('#footerArea').css('display')!='none')
			$('#thumbOpener').cssanimate({bottom:$('#footerArea').height()+'px'}, {duration:500});
		else
			$('#thumbOpener').cssanimate({bottom:'0px'}, {duration:500});
		
		function thumbOpenerAction(){
			if($('#bgImagesContainer').height()<=4){
				if(!useFullImage){
					if($('#footerArea').css('display')=='none'){
						$('#thumbOpener').removeClass('thumbOpen').addClass('thumbClose').cssanimate({bottom:'124px'}, {duration:500});
					}else{
						$('#thumbOpener').removeClass('thumbOpen').addClass('thumbClose').cssanimate({bottom:($('#footerArea').height()+124)+'px'}, {duration:500});
					}
				}else{
					$('#thumbOpener').removeClass('thumbOpen').addClass('thumbClose').cssanimate({bottom:'124px'}, {duration:500});
				}
				galeriThumbsMoveUp();
				$('#bgImagesContainer').hammer({prevent_default:false}).on("dragstart", bgThumbDragStart);
				$('#bgImagesContainer').hammer({prevent_default:false}).on("drag", bgThumbDrag);
			}else{
				if(!useFullImage){
					if($('#footerArea').css('display')=='none'){
						$('#thumbOpener').removeClass('thumbClose').addClass('thumbOpen').cssanimate({bottom:'0px'}, {duration:500});
					}else{
						$('#thumbOpener').removeClass('thumbClose').addClass('thumbOpen').cssanimate({bottom:$('#footerArea').height()+'px'}, {duration:500});
					}
					
				}else{
					$('#thumbOpener').removeClass('thumbClose').addClass('thumbOpen').cssanimate({bottom:'0px'}, {duration:500});
				}
				galeriThumbsMoveDown();
				$('#bgImagesContainer').hammer({prevent_default:false}).off("dragstart");
				$('#bgImagesContainer').hammer({prevent_default:false}).off("drag");
			}
		}
		if(Modernizr.touch)
			$('#thumbOpener').hammer({prevent_default:false}).on('tap',thumbOpenerAction);
		else
			$('#thumbOpener').click(thumbOpenerAction);
	}
	
	$('#menu-container').hammer({prevent_default:false}).on("dragstart", menuDragStart);
	$('#menu-container').hammer({prevent_default:false}).on("drag", menuDrag);
	$('#menu-container').hammer({prevent_default:false}).on("dragend", menuDragEnd);
	
	if(!mobileDevice){
		$(document).bind('mousemove', galeriThumbsMouseMove);
		$(document).bind('mousemove', bgImageMove);
	}
	
	setPlaylist();
	
	galleryThumbs();
	initMenu();
	doSize();
	
	$('#bodyLoading').delay(1000).animate({left:'100%'}, 1000, 'easeOutQuad', function(){
		$(this).remove();
		$('#body-wrapper').animate({opacity:'1'}, 1000);
	});

	setBgPlayPauseFunctions();
	
	$('.listAudio').hover(showPlayerWrapper, hidePlayerWrapper);
	$('#playWrapper').hover(showPlayerWrapper, hidePlayerWrapper);

	
	if($('#audioList ul li').length<1){
			$('.footerAudioControls').hide();
	}
	
	
	$("a[data-tip]").each(function(){
		var rndId = 'txt_'+randomString(5);
		$(this).hover(function(){
			var addSpan = $('<div class="footerTip"><span>'+$(this).data('tip')+'</span></div>').attr('id', rndId);
			$('#footerTips').append(addSpan);
			var lrMargin = 20;
			if(winW<960) lrMargin = 10;
			$('#footerTips').css({bottom:(winH-$('#footerArea').position().top), left:lrMargin, right:lrMargin});
			$('#'+rndId).stop(true).show().animate({height: 20}, 300, 'easeOutQuad', function(){
				$('#'+rndId+' span').animate({right:0, opacity:'1'}, 300, 'easeOutQuad', function(){});
			});
		},function(){
			$('#'+rndId+' span').animate({right:20, opacity:'0'}, 300, 'easeOutQuad', function(){
				$('#'+rndId).animate({height:0}, 300, 'easeOutQuad',function(){
					$(this).remove();
				})
			});
		});
	});
	
	
	if(Modernizr.history && historyApiEnable){
		$('#headersubsearchform').unbind('submit').attr('onsubmit','');
		$('#headersubsearchform').submit(function(){
			//openPage('/?s='+$('.searchboxhs').val(), true);
			return false;
		});
	}
	
	if(Modernizr.touch){
		$('#closeMenu').hammer({prevent_default:true}).on("tap", mainMenuClose);
		$('#openMenu').hammer({prevent_default:true}).on("tap", mainMenuOpen);
	}else{
		$('#closeMenu').click(mainMenuClose);
		$('#openMenu').click(mainMenuOpen);
	}
	
	
	galeriThumbsHorizontalMove();
	
	$('.pauseVideo').click(function(){
		pauseBgVideo();
	});
	
	$('.playVideo').click(function(){
		playBgVideo();
	});
	
	$('.muteVideo').click(function(){
		videoMute();
	});
	$('.unmuteVideo').click(function(){
		videoUnMute();
	});
}

function mainMenuOpen(e){
	e.preventDefault();
	if(typeof e.gesture != 'undefined')
		e.gesture.preventDefault();
	$('#menu-container').unbind('mouseenter mouseleave');
	$('#menu-container').removeClass('stayClose').addClass('stayOpen');
	$('#closeMenu').show().css('opacity','0').animate({opacity:1}, 300);
	openMainMenu();
	contentResizer();
}

function mainMenuClose(e){
	e.preventDefault();
	if(typeof e.gesture != 'undefined')
		e.gesture.preventDefault();
	$('#menu-container').removeClass('stayOpen').addClass('stayClose');
	$('#closeMenu').animate({opacity:0}, 1000, function(){ $(this).hide(); });
	closeMainMenu();
	contentResizer();
}

function setBgPlayPauseFunctions(){
	$('.currentPlayPause, .footerBtn.playGallery, .footerBtn.pauseGallery').unbind('click');
	if(Modernizr.touch)
		$('.currentPlayPause, .footerBtn.playGallery, .footerBtn.pauseGallery').hammer({prevent_default:true}).on("tap", toggleBgPlayPause);
	else
		$('.currentPlayPause, .footerBtn.playGallery, .footerBtn.pauseGallery').click(toggleBgPlayPause);

}

function toggleBgPlayPause(e){
	if(bgPaused) {
		playBg();
		$('.currentItemPlayed').stop().animate({left:25, opacity:'1'}, 400, function(){ $(this).remove(); });
		$('.currentPlayPause').append($('<div></div>').addClass('currentItemPaused'));
		$('.footerBtn.pauseGallery').css('display','inline-block');
		$('.footerBtn.playGallery').hide();
	}else{
		pauseBg();
		$('.currentItemPaused').stop().animate({left:25, opacity:'1'}, 400, function(){ $(this).remove(); });
		$('.currentPlayPause').append($('<div></div>').addClass('currentItemPlayed'));
		$('.footerBtn.playGallery').css('display','inline-block');
		$('.footerBtn.pauseGallery').hide();
	}
}

function blogloadmore(){
	$('.blogloadmorebutton').click(function(e){
		e.preventDefault();
		$('.isotope-blog').each(function(){
			var $activeBlog = $(this);
			$activeBlog.find('.blogloadmorebutton').animate({opacity:0}, 300, function(){
				$(this).hide();
				$activeBlog.find('.blogloadmoreloading').css({display:'block', opacity:'0'}).animate({opacity:1}, 300);
			});
			
			$.ajax({
				type: "post",
				url: 'blogmore.html',
				data: "cats="+$(this).data('cats')+"&postperpage="+$(this).data('postperpage')+"&paged="+$(this).data('paged')+"&metaformat="+$(this).data('metaformat'),
				success: function(data){
					$htmlContent = $("<div/>").html(data);
					var newItems = $htmlContent.find('.isotope-blog').html();
					var nextItems = parseInt($htmlContent.find('.isotope-blog').data('nextpage'));
					$activeBlog.isotope( 'insert', $(newItems) );
					$activeBlog.imagesLoaded(function(){
						var loadmoreitem = $('.isotope-blog .loadmoreitem')[0].outerHTML;
						$activeBlog.isotope( 'remove', $('.isotope-blog .loadmoreitem'));
						
						if(nextItems==1){
							$activeBlog.isotope( 'insert', $(loadmoreitem) );
							$activeBlog.find('.blogloadmorebutton').parents('.blogitem-container').removeClass('animated').css({opacity:0});
							$activeBlog.find('.blogloadmorebutton').css({opacity:'1', display:'block'});
							$activeBlog.find('.blogloadmoreloading').css({opacity:'0', display:'none'});
							blogloadmore();
						}
						
						pageBehaviors();
						setLink();
						setImageAnimations();
						setImageModal();
						resizeIsotope();
						setTimeout(function(){
							$activeBlog.find('.blogitem-container:not(.animated)').css({top:200, opacity:0});
							animateBlogItems($activeBlog.find('.blogitem-container:not(.animated)'));
						},800);
					});
				}
			});
		});
	});
}

function openMainMenu(){
	if($('#menu-container').hasClass('menuDefaultClose')){
		$('#menu-container').addClass('stayClose').removeClass('menuDefaultClose');
		closeMainMenu();
		contentResizer();
		return false;
	}
	if($('#menu-container').position().left==0) return false;
	$('#menu-container').animate({left:0}, {queue:false, duration:1000});
	if($(document).width()>768){
		$("#contentBox").getNiceScroll().hide();
		$('#content, #bgPlayer, #bgImagesContainer').animate({left:240}, {queue:false, duration:1000, complete:function(){
			$("#contentBox").getNiceScroll().resize();
			$("#contentBox").getNiceScroll().show();
		}});
	}
	$('#openMenu').stop().animate({opacity:0}, 300, function(){ $(this).hide(); });
}

function closeMainMenu(){
	if($('#menu-container').position().left==-230) return false;
	subMenuDoClose($('ul.menu'));
	$("#contentBox").getNiceScroll().hide();
	$('#menu-container').animate({left:-230}, {queue:false, duration:1000, complete:function(){
		$("#contentBox").getNiceScroll().resize();
		$("#contentBox").getNiceScroll().show();
	}});
	$('#content, #bgPlayer, #bgImagesContainer').animate({left:10}, {queue:false, duration:1000});
	if($('#openMenu').is(':hidden') && !$('#menu-container').hasClass('forceClose')){
		$('#openMenu').stop().show().css({opacity:0}).delay(500).animate({opacity:1}, {duration:300, complete:function(){
				if(!mobileDevice){
					$('#menu-container').unbind('mouseenter').bind('mouseenter', autoOpenMainMenu);
					$('#menu-container').unbind('mouseleave').bind('mouseleave', autoCloseMainMenu);
				}
			}
		});
	}
}

var autoCloseTimer;
function autoOpenMainMenu(){
	if($(this).hasClass('stayClose') && $(document).width()>768){
		clearTimeout(autoCloseTimer);
		openMainMenu();
		contentResizer();
	}
}

function autoCloseMainMenu(){
	autoCloseTimer = setTimeout( function() {
		if($('#menu-container').hasClass('stayClose') && $(document).width()>768){
			closeMainMenu();

			contentResizer();
		}else if($('#openMenu').is(':hidden')){
			$('#openMenu').show().css({opacity:0}).animate({opacity:1}, 300);
		}
	}, 1000);

}

var looper;
function contentResizer(){
	clearInterval(looper);
	var counter = 0;
	looper = setInterval(function(){
		counter++;
		resizeIsotope();
		doSize(true);
		if (counter >= 10)	clearInterval(looper);
	}, 100);
}


var bgThumbsStartX = 0;
function bgThumbDragStart(event){
	event.gesture.preventDefault();
	bgThumbsStartX = $('#bgImages').position().left;
}
function bgThumbDrag(event) {
	event.gesture.preventDefault();
	var newX = bgThumbsStartX+(event.gesture.deltaX*1);
	if(newX>0)newX = 0;
	var minX = ($('#bgImages').width()-$('#bgImagesContainer').width())*-1;
	if(newX<minX) newX = minX;
	$('#bgImages').css({left:newX});
}

var menuDragStartY = 0;
function menuDragStart(event){
	if(typeof event.gesture != 'undefined')
		event.gesture.preventDefault();
	if($('#menu-container').height()>$('#menu-wrapper').height()) return false;
	$('#menu-container').removeClass('menu-openhand').addClass('menu-closedhand');
	menuDragStartY = $('#menu-wrapper').position().top;
}
function menuDrag(event) {
	if(typeof event.gesture != 'undefined')
		event.gesture.preventDefault();
	if($('#menu-container').height()>$('#menu-wrapper').height()) return false;
	var newY = menuDragStartY+(event.gesture.deltaY*1);
	if(newY>0)newY = 0;
	var minY = ($('#menu-wrapper').height()-$('#menu-container').height())*-1;
	if(newY<minY) newY = minY;
	$('#menu-wrapper').css({top:newY});
}
function menuDragEnd(event){
	event.gesture.preventDefault();
	if($('#menu-container').height()>$('#menu-wrapper').height()) return false;
	$('#menu-container').addClass('menu-openhand').removeClass('menu-closedhand');
}

var playerDelayHide;
function showPlayerWrapper(){
	clearTimeout(playerDelayHide);
	galeriThumbsMoveDown();
	$('#playWrapper:hidden').show();
	var currentH = $('#playWrapper').outerHeight();
	$('#playWrapper').css('height', 'auto');
	var orginalH = $('#playWrapper').outerHeight();
	$('#playWrapper').css('height', currentH+'px');
	if($('#playWrapper').height()<=0)
		$('#playWrapper').css({height:1});
	$('#playWrapper').stop().animate({height: orginalH}, {queue:true, duration:500, easing:'easeOutQuad'});
}

function hidePlayerWrapper(){
	playerDelayHide = setTimeout(function(){
		$('#playWrapper').stop().animate({height:0}, {queue:true, duration:500, easing:'easeOutQuad', complete:function(){
			$('#playWrapper').hide();
		}});
	}, 200);
}

// Loads the next tweets
function loadTweets(){
	$.ajax({
		type: "post",
		url: 'twitter-widget/twitter.php',
		data: "",
		success: function(data){
			$('#TwitterFeed ul li').hide();
			$('#TwitterFeed ul').html(data);
			if($('#TwitterFeed ul li').length==0)
				$('#TwitterFeed').hide();
			else if($('#TwitterFeed ul li').length==1)
				$('#TwitterFeed ul li').show();
			else if($('#TwitterFeed ul li').length>1)
				nextTweet();
		},
		error: function(){
			$('#TwitterFeed').hide();
		}
	});
};

function nextTweet(){
	var $tw = $('#TwitterFeed ul');
	if($tw.find('li.active').length==0)
		$tw.find('li:first-child').addClass('next');
	else{
		if(!$tw.find('li.active').is(':last-child'))
			$tw.find('li.active').next().addClass('next')
		else
			$tw.find('li:first-child').addClass('next');
	}
	
	$tw.find('li.next').show();
	var nextH = $tw.find('li.next').height();
	$tw.find('li.next').hide();
	
	if($tw.find('li.active').length>0){
		$tw.find('li.active').animate({opacity:0}, 500, function(){
			$(this).removeClass('active').hide();
		});
	}
	$tw.find('li.next').css({opacity:0, display:'block'}).delay(300).animate({opacity:1}, 500,function(){
		$(this).removeClass('next').addClass('active');
	});
	nextH = (nextH<120)?120:nextH;
	$tw.animate({height:nextH}, 500, function(){});
	setTimeout(nextTweet, 6000);
}

/*Loading Animation*/
function showLoading(){
	$('#contentLoading').show().stop().animate({opacity:'1'}, 300, 'easeOutQuad');
}
function hideLoading(){
	$('#contentLoading').stop().animate({opacity:'0'}, 300, 'easeOutQuad', function(){
		$(this).hide();
	});
}

/* Sub Thumb Gallery */
function galeriThumbsMouseMove(e)
{
	// Horizontal Move
	galeriThumbsHorizontalMove(e.pageX);
	// Vertical Move
	if(!useFullImage){
		if(e.pageY > $(document).height()-100 ){
			galeriThumbsMoveUp();
		}else if(e.pageY < $(document).height()-164 ){
			galeriThumbsMoveDown();
		}
	}else{
		if(e.pageY > $(document).height()-160 && e.pageY < $(document).height())
			galeriThumbsMoveUp();
		else
			galeriThumbsMoveDown();
	}
}
function galeriThumbsHorizontalMove(param_pageX){
	param_pageX = (typeof param_pageX != 'undefined')?param_pageX:0;
	if(($('#bgImages').width()>$('#bgImagesContainer').width())){
		param_pageX -= $('#bgImagesContainer').offset().left;
		var posLeft = parseInt((($('#bgImagesContainer').width()-$('#bgImages').width())/$('#bgImagesContainer').width())*param_pageX);
		posLeft = (posLeft>0)?0:posLeft;
		$('#bgImages').stop().animate({left:posLeft}, {queue:false, duration:400, easing:'easeOutQuad'});
	}else{
		if(!mobileDevice)
			var posLeft = parseInt(($('#bgImagesContainer').width()-$('#bgImages').width())/2);
		else
			var posLeft = parseInt($('#bgImagesContainer').width()-$('#bgImages').width());
		$('#bgImages').stop().animate({left:posLeft}, {queue:false, duration:400, easing:'easeOutQuad'});
	}
}

function galeriThumbsMoveUp(){
	if($('#playWrapper').height()>=1){
		galeriThumbsMoveDown();
		return false;
	}
	if($('#bgImages li').length<2) return false;
	if($('#bgImagesContainer').height()<=4){
		$('#bgImagesContainer').stop().animate({height:124}, 500, 'easeOutQuad');
	}
}
function galeriThumbsMoveDown(){
	if($('#bgImagesContainer').height()>4){
		$('#bgImagesContainer').stop().animate({height:4}, { duration:500, easing:'easeOutQuad', complete:function(){} } );
	}
}

function bgImageMove(e){
	if(useFullImage && !useFitMode && activePlayer=='none')
	{
		if($(document).width()<$('#mediaWrapper .new').width())
			var xPos = parseInt((($(document).width()-$('#mediaWrapper .new').width())/$(document).width())*e.pageX);
		else
			var xPos = ($(document).width()-$('#mediaWrapper .new').width())/2;
		if($(document).height()<$('#mediaWrapper .new').height())
			var yPos = parseInt((($(document).height()-$('#mediaWrapper .new').height())/$(document).height())*e.pageY);
		else
			var yPos = ($(document).height()-$('#mediaWrapper .new').height())/2;
		$('#mediaWrapper .new').animate({left:xPos, top:yPos}, {queue:false, duration:400, easing:'easeOutQuad'});
	}
}

function galleryThumbs(activeItem, mode){
	if($('#bgImages li').length<1){
		return false;
	}
	
	if(mobileDevice && videoSkipMobile){
		if($('#bgImages li').length>0){
			$('#bgImages li').each(function(){
				var mediaType = getMediaType($(this).find('a').attr('href'));
				if((mediaType=='youtube' || mediaType=='vimeo' || mediaType=='flash') )
					$(this).remove();
			});
		}
	}
	
	$('#bgImages li a').live('click',function(){
		return false;
	});
	
	var totalBgImagesWidth = 0;
	$('#bgImages li img.thumb').each(function(){
		totalBgImagesWidth+=$(this).width();
	});
	totalBgImagesWidth+=1;
	$('#bgImages').css('width', totalBgImagesWidth+'px');

	$('#bgImages li').click(function(){
		if(!$(this).hasClass('active') && !bgRunning)
		{
			clearInterval(bgTimer);
			$('#bgImages li').removeClass('active');
			$(this).addClass('active');
			runBg();
		}
	});
	
	$('#bgImages li > a').each(function(){
		var mediaType = getMediaType($(this).attr('href'));
		$(this).append( $('<div></div>').addClass('thumbWrapperBg') );
		var $thumbWrapper = $('<div></div>').addClass('thumbWrapper');
		if(mediaType=='youtube' || mediaType=='vimeo' || mediaType=='videojs')
			$thumbWrapper.append($('<span></span>').addClass('thumbType thumbVideo') );
		else
			$thumbWrapper.append($('<span></span>').addClass('thumbType thumbImage') );
		$(this).append($thumbWrapper);
	});
	$('#bgImages a').each( function(i,n) { $(this).hoverdir(); } );
	
	if(activeItem==undefined){
		if($('#bgImages li.active').length!=1){
			$('#bgImages li').removeClass('active');
			$('#bgImages li:nth-child(1)').addClass('active');
		}
	}else{
		$('#bgImages li').removeClass('active');
		$('#bgImages li a[href="'+activeItem+'"]').parent().addClass('active');
		if($('#bgImages li.active').length!=1){
			$('#bgImages li').removeClass('active');
			$('#bgImages li:nth-child(1)').addClass('active');
		}
	}
	setBgPlayStatus();
	if(mode==undefined){
		//
	}else if(mode=='fit')
		changeMode(true, true);
	else if(mode == 'full')
		changeMode(true, false);
	runBg();
}

function galleryControls(show, pattern){
	var patternV = (typeof pattern=='undefined')?'default':pattern;
	if(bgPatternV=='none') patternV = 'hide';
	if(show){
		$('.footerBgControls').hide();
		$('#bgText').cssanimate({opacity:1}, {duration:500});
		if(!mobileDevice){
			$('.prevBG, .nextBG').css({display:'block', opacity:0}).animate({opacity:1}, {duration:500});
		}
		$('.itemNumbers').show();
		$('.screenControl').show();
		$('.fitBG').hide();
		$('.fullCenterBG').show();
		$('.fitCenterBG').hide();
	}else{
		var galleryID = parseInt($('#bgImages').data('gallery-id'));
		if(galleryID>0)
		$('.footerBgControls').css('display', 'inline-block');
		$('#bgText').cssanimate({opacity:0}, {duration:500});
		$('.fitCenterBG').hide();
		$('.fullCenterBG').hide();
		$('.prevBG, .nextBG').animate({opacity:0}, {duration:500, complete:function(){
			$(this).css({display:'none'});
		}});
		$('.itemNumbers').hide();
		$('.screenControl').hide();
	}
	
	if(patternV=='show'){
		$('#bgPattern').show().cssanimate({opacity:1}, {duration:500});
	}else if(patternV=='hide'){
		$('#bgPattern').cssanimate({opacity:0}, {duration:500, complete:function(){
			$(this).hide();
		}});
	}
	
	if(Modernizr.touch){
		$('.fitCenterBG').hammer({prevent_default:true}).off("tap").on("tap", setFit);
		$('.fullCenterBG').hammer({prevent_default:true}).off("tap").on("tap", setFull);
		$('.prevBG').hammer({prevent_default:true}).off("tap").on("tap", prevBg);
		$('.nextBG').hammer({prevent_default:true}).off("tap").on("tap", nextBg);
		$('.fitBG').hammer({prevent_default:true}).off("tap").on("tap", setMin);
		$('#videoExpander').hammer({prevent_default:true}).off("tap").on("tap", videoExpand);
	}else{
		$('.prevBG').unbind('click').click(prevBg);
		$('.nextBG').unbind('click').click(nextBg);
		$('.fullCenterBG').unbind('click').click(setFull);
		$('.fitCenterBG').unbind('click').click(setFit);
		$('.fitBG').unbind('click').click(setMin);
		$('#videoExpander').unbind('click').click(videoExpand);
	}
	function videoExpand(){
		window.open($('#videoExpander').data('link'));
	}
}
function changeMode(fullM, fitM){
	if(fitM==true)
		fullM=true
	if(!fullM){
		$('.fitBG').hide();
		if(! ($.trim($('#contentBoxContainer').html())=='' || $.trim($('#content').html())=='') ){
			$("#contentBox").getNiceScroll().resize();
			$("#contentBox").getNiceScroll().show();
			galleryControls(false, 'show');
		}else{
			galleryControls(true, 'show');
		}
	}else{
		galleryControls(true, 'hide');
		$("#contentBox").getNiceScroll().hide();
		$('.fitBG').show();
	}

	if(useFullImage!=fullM || fitM!=useFitMode)
	{
		useFullImage = fullM;
		useFitMode = fitM;
		
		if(fullM){
			if(fitM){
				$('.fullCenterBG').show();
				$('.fitCenterBG').hide();
			}else{
				$('.fitCenterBG').show();
				$('.fullCenterBG').hide();
			}
		}else{
			if($.trim($('#contentBoxContainer').html())=='' || $.trim($('#content').html())==''){
				$('.fullCenterBG').show();
				$('.fitCenterBG').hide();
			}else{
				$('.fullCenterBG').hide();
				$('.fitCenterBG').hide();
			}
		}
		
		
		galeriThumbsMoveDown();
		$('#thumbOpener').removeClass('thumbClose').addClass('thumbOpen');
		
		if(fullM){
			if($('#content').is(':visible')){
				if($.trim($('#contentBoxContainer').html())!=''){
					$('#content').cssanimate({opacity:'0'}, {duration:500, complete:function(){
						$(this).hide();
					}});
				}
			}
			$('#menu-container').addClass('forceClose').cssanimate({left:($('#menu-container').width()*-1)+'px'}, {duration:1000});
			$('#openMenu').stop().animate({opacity:0}, {duration:1000, complete:function(){ $(this).hide(); } });
			$('#footerArea').cssanimate({bottom:($('#footerArea').height()*-1)+'px'}, {duration:1000});
			$('#thumbOpener').cssanimate({bottom:'4px'}, {duration:1000});
			$('#bgImagesContainer').cssanimate({bottom:'0px', left:'0px'}, {duration:1000});
			$('#bgPlayer').cssanimate({left:'0px', bottom:'4px', backgroundColor:'#000000'}, {duration:1000, complete:function(){ doSize(); }});
			doSize();
			subMenuDoClose($('ul.menu'));
			
			$('#bgPlayer').hammer({prevent_default:true}).on("pinch", function(event) {
				var newImageValues = getNewImageSize(1);
				var imgW = parseInt(parseInt($('#bgPlayer .new').width())*event.gesture.scale*0.50);
				var imgH = parseInt(parseInt($('#bgPlayer .new').height())*event.gesture.scale*0.50);
				var imgWO = newImageValues.imgWO;
				var imgHO = newImageValues.imgHO;
				var imgWF = newImageValues.imgWF;
				var imgHF = newImageValues.imgHF;
				if(imgW>imgWO){ imgW = imgWO; imgH = imgHO; }
				if(imgW<imgWF){ imgW = imgWF; imgH = imgHF; }
				imgLeft = parseInt((winW-imgW)/2);
				imgTop = parseInt((winH-imgH)/2);
				$('#bgPlayer .new').stop(true).css({left:imgLeft+'px', top:imgTop+'px', width:imgW+'px', height:imgH+'px'});
			});
			var bgImagesStartX = 0;
			var bgImagesStartY = 0;
			$('#bgPlayer').hammer({prevent_default:true}).on("dragstart", function(event) {
				bgImagesStartX = $('#bgPlayer .new').position().left;
				bgImagesStartY = $('#bgPlayer .new').position().top;
			});
			$('#bgPlayer').hammer({prevent_default:true}).on("drag", function(event) {
				$('#bgPlayer .new').stop(true).css({left:(bgImagesStartX+event.gesture.deltaX)+'px', top:(bgImagesStartY+event.gesture.deltaY)+'px'});
			});
			
		}else{
			$('#bgPlayer').hammer({prevent_default:true}).off("pinch");
			$('#bgPlayer').hammer({prevent_default:true}).off("dragstart");
			$('#bgPlayer').hammer({prevent_default:true}).off("drag");
			
			if($.trim($('#contentBoxContainer').html())!=''){
				$('#content').css({display:'block', opacity:0}).cssanimate({opacity:'1'}, {duration:1000});
			}
			
			var bottomWithFooter = 0;
			if($('#footerArea').css('display')!='none'){
				$('#footerArea').cssanimate({bottom:'0px'}, {duration:1000});
				bottomWithFooter = $('#footerArea').height();
			}
			
			
			if($('#menu-container').hasClass('stayClose')){
				// if menu was closed
				$('#openMenu').show().animate({opacity:1}, 1000);
				$('#menu-container').cssanimate({left:(($('#menu-container').width()*-1)+10)}, {duration:1000, complete:function(){
					$(this).removeClass('forceClose');
				}});
				$('#bgImagesContainer').cssanimate({bottom:bottomWithFooter, left:10}, {duration:1000});
				$('#bgPlayer').cssanimate({backgroundColor:'transparent'}, {duration:1000});
				$('#bgPlayer').animate({left:10, bottom:bottomWithFooter}, 1000);
			}else{
				// if menu was opened
				$('#menu-container').cssanimate({left:0}, {duration:1000, complete:function(){
					$(this).removeClass('forceClose');
				}});
				$('#bgImagesContainer').cssanimate({bottom:bottomWithFooter, left:$('#menu-container').width()}, {duration:1000});
				$('#bgPlayer').cssanimate({backgroundColor:'transparent'}, {duration:1000});
				$('#bgPlayer').animate({left:$('#menu-container').width(), bottom:bottomWithFooter}, 1000);
			}
			$('#thumbOpener').cssanimate({bottom:bottomWithFooter+4}, {duration:1000});
			
			if(tempThumbs!='' || parseInt($('#bgImages').data('gallery-id'))==0 ){
				$('#bgImages').html(tempThumbs);
				$('#bgPlayer').html(tempActive);
				bgPaused = tempbgPaused;
				tempThumbs = '';
				tempActive = '';
				galleryThumbs();
				activePlayer='none';
				if($('#bgPlayer').find('#ytVideo').length>0)
					activePlayer = 'youtube';
				else if($('#bgPlayer').find('#vmVideo').length>0)
					activePlayer = 'vimeo';
				else if($('#bgPlayer').find('#jsVideo').length>0)
					activePlayer = 'videojs';
				else if($('#bgPlayer').find('#swfContent').length>0)
					activePlayer = 'flash';
			}
			doSize();
			subMenuDoClose($('ul.menu'));
		}
	}
	useFullImage = fullM;
	useFitMode = fitM;
	
	setBgPlayPauseFunctions();
}

function setFull(){
	changeMode(true, false);
}

function setMin(){
	changeMode(false, false);
}

function setFit(){
	changeMode(true, true);
}

var mainmenutimer;
var mainmenurunning = false;
// init menu
function initMenu(){
	showMenu();
}


function setBgPlayStatus(){
	if(!bgPaused){
		$('.currentPlayPause div').remove();
		$('.currentPlayPause').append($('<div></div>'));
		$('.currentPlayPause div').addClass('currentItemPaused');
		$('.footerBtn.pauseGallery').css('display','inline-block');
		$('.footerBtn.playGallery').hide();
	}else{
		$('.currentPlayPause div').remove();
		$('.currentPlayPause').append($('<div></div>'));
		$('.currentPlayPause div').addClass('currentItemPlayed');
		$('.footerBtn.playGallery').css('display','inline-block');
		$('.footerBtn.pauseGallery').hide();
	}
}

function getNewImageSize(multiplier){
	var pW = $('#bgPlayer').width(),
		pH = $('#bgPlayer').height(),
		pRatio = $('#bgPlayer').width() / $('#bgPlayer').height();
	if(activePlayer!='none'){
		var mediaUrl = $('#bgImages li.active a').attr('href');
		var mediaParams = getParamsFromUrl(mediaUrl);
		imgWO = parseInt(mediaParams['width']);
		imgHO = parseInt(mediaParams['height']);
	}else{
		var imgWO = parseInt($('#bgPlayer img.new').attr('owidth'));
		var imgHO = parseInt($('#bgPlayer img.new').attr('oheight'));
	}
	var imgRatio = imgWO/imgHO;
	
	if((pRatio>imgRatio))
	{
		var imgW = parseInt(pW);
		var imgH = parseInt(imgW/imgRatio);
		
	}else{
		var imgH = pH;
		var imgW = parseInt(imgH*imgRatio);
	}
	
	if((pRatio>imgRatio))
	{
		var imgHF = parseInt(pH);
		var imgWF = parseInt(imgHF*imgRatio);
		
	}else{
		var imgWF = parseInt(pW);
		var imgHF = parseInt(imgWF/imgRatio);
	}
	return {imgW:imgW*multiplier, imgH:imgH*multiplier, imgHF:imgHF*multiplier, imgWF:imgWF*multiplier, imgWO:imgWO, imgHO:imgHO, imgRatio:imgRatio};
}

// Resize All Elements
var winW = $(window).width();
var winH = $(window).height();
function doSize(checkMenu){
	if(checkMenu==undefined){
		if(!$('#menu-container').hasClass('forceClose')){
			if($(document).width()>768 && !$('#menu-container').hasClass('stayClose')){
				openMainMenu();
			}else if($(document).width()<=768 && !$('#menu-container').hasClass('stayOpen')){
				closeMainMenu();
			}
		}
	}
	
	if($('#menu-container').height()<$('#menu-wrapper').height()){
		$('#menu-container').addClass('menu-openhand');
	}else{
		$('#menu-wrapper').css('top','0');
		$('#menu-container').removeClass('menu-openhand').removeClass('menu-closedhand');
	}
	
	winW = $(window).width();
	winH = $(window).height();
	if( navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) || navigator.userAgent.match(/iPhone;.*CPU.*OS 7_\d/i) )
		fixViewportHeight();
	
	if($('#bgImages li').length>0){
	var mediaUrl = $('#bgImages li.active a').attr('href');
	var mediaParams = getParamsFromUrl(mediaUrl);
	var imgLeft=0;
	var imgTop=0;
	
	var newImageValues = getNewImageSize(1);
	var imgW = newImageValues.imgW;
	var imgH = newImageValues.imgH;
	var imgHF = newImageValues.imgHF;
	var imgWF = newImageValues.imgWF;
	var imgWO = newImageValues.imgWO;
	var imgHO = newImageValues.imgHO;
	var imgRatio = newImageValues.imgRatio;

	// Set Bg Image W, H
	var newImageW = 0;
	var newImageH = 0;
	if(!useFullImage && bgStretch){
		newImageW = imgW;
		newImageH = imgH;
		if(activePlayer == 'youtube'){
			ytplayer.setSize(imgW, imgH);
		}
		else if(activePlayer == 'vimeo')
			$('#vimeoplayer').css({width:imgW+'px', height:imgH+'px'});
		else if(activePlayer == 'flash'){
			$('#swfWrapper, #swfWrapper object, #swfWrapper embed').css({width:imgW+'px', height:imgH+'px'});
		}
		else if(activePlayer == 'videojs')
			$('#jsP .video-js').css({width:imgW+'px', height:imgH+'px'});
	}else{
		if(!useFullImage && !bgStretch){
			newImageW = imgWF;
			newImageH = imgHF;
		}else if(!useFitMode){
			newImageW = imgWO;
			newImageH = imgHO;
		}else{
			newImageW = imgWF;
			newImageH = imgHF;
		}
		
		if(activePlayer == 'youtube')
			ytplayer.setSize($('#bgPlayer').width(), ($('#bgPlayer').height()-80));
		else if(activePlayer == 'vimeo')
			$('#vimeoplayer').css({width:$('#bgPlayer').width(), height:($('#bgPlayer').height()-80)});
		else if(activePlayer == 'flash'){
			$('#swfWrapper, #swfWrapper object, #swfWrapper embed').css({width:imgWO+'px', height:imgHO+'px'});
			newImageW = imgWO;
			newImageH = imgHO;
		}else if(activePlayer == 'videojs')
			$('#jsP .video-js').css({width:$('#bgPlayer').width()+'px', height:($('#bgPlayer').height()-80)+'px'});
	}
	$('#bgPattern').css({width:$('#bgPlayer').width(), height:$('#bgPlayer').height()});
	
	if(useFullImage && !(activePlayer=='none' || activePlayer=='flash')){
		imgLeft = imgTop = 0;
	}else if(!useFullImage && !bgStretch && !(activePlayer=='none' || activePlayer=='flash')){
		imgLeft = imgTop = 0;
	}else{
		imgLeft = parseInt(($('#bgPlayer').width()-newImageW)/2);
		imgTop = parseInt(($('#bgPlayer').height()-newImageH)/2);
	}
	// Set Bg Image Position
	if(!bgRunning)
		$('#bgPlayer .new').stop(true).animate({left:imgLeft, top:imgTop, width:newImageW, height:newImageH}, {queue:false, duration: 500});
	else
		$('#bgPlayer .new').stop(true).css({left:imgLeft+'px', top:imgTop+'px', width:newImageW+'px', height:newImageH+'px'});
	}
}

function rFalse(event){	return false; }

// Background Image Auto Next
function autoBg(){
	if(bgPaused) return false;
	nextBg();
	$('#mediaTimer').css('width','0');
}

// Background Image Next Button
function nextBg() {
	if($('#bgImages li').length<=1) return false;
	if(bgRunning) return false;
	clearInterval(bgTimer);
	if(!$('#bgImages li:nth-child('+$('#bgImages li').length+')').hasClass('active')){
		$('#bgImages li.active').removeClass('active').next().addClass('active');
		runBg();
	}else if(loopBg){
		$('#bgImages li').removeClass('active').parent().find('li:nth-child(1)').addClass('active');
		runBg();
	}
}

// Background Image Prev Button
function prevBg(){
	if($('#bgImages li').length<=1) return false;
	if(bgRunning) return false;
	clearInterval(bgTimer);
	if(!$('#bgImages li:nth-child(1)').hasClass('active'))
		$('#bgImages li.active').removeClass('active').prev().addClass('active');
	else{
		$('#bgImages li.active').removeClass('active');
		$('#bgImages li:nth-child('+$('#bgImages li').length+')').addClass('active');
	}
	runBg();
	$('#mediaTimer').css('width','0');
}

// Background Image Pause Button
function pauseBg(){
	clearInterval(timecircleTimer);
	hideBgImageLoading();
	bgPaused = true;
	$('#mediaTimer').css('width','0');
}

// Background Image Play Button
function playBg(){
	clearInterval(bgTimer);
	bgPaused = false;
	if(activePlayer=='youtube' || activePlayer=='vimeo' || activePlayer=='videojs'){
	}else
		nextBg();
}

function pauseBgVideo(){
	if(activePlayer=='youtube')
		ytplayer.stopVideo();
	else if(activePlayer=='vimeo')
		$f(vmplayer).api('pause');
	else if(activePlayer=='videojs'){
		var htmlvideoid = $('#jsP .video-js').attr('id');
		videojs(htmlvideoid).pause();
	}
	$('.pauseVideo').hide();
	$('.playVideo').css('display','inline-block');
}

function playBgVideo(){
	if(activePlayer=='youtube')
		ytplayer.playVideo();
	else if(activePlayer=='vimeo')
		$f(vmplayer).api('play');
	else if(activePlayer=='videojs'){
		var htmlvideoid = $('#jsP .video-js').attr('id');
		videojs(htmlvideoid).play();
	}
	$('.playVideo').hide();
	$('.pauseVideo').css('display','inline-block');
}


function videoMute(){
	if(activePlayer=='youtube')
		ytplayer.mute();
	else if(activePlayer=='vimeo')
		$f(vmplayer).api('setVolume',0);
	else if(activePlayer=='videojs'){
		var htmlvideoid = $('#jsP .video-js').attr('id');
		videojs(htmlvideoid).muted(true);
	}
	videoMuted=true;
	setVideoMuteIcon();
}

function videoUnMute(){
	if(activePlayer=='youtube')
		ytplayer.unMute();
	else if(activePlayer=='vimeo')
		$f(vmplayer).api('setVolume',1);
	else if(activePlayer=='videojs'){
		var htmlvideoid = $('#jsP .video-js').attr('id');
		videojs(htmlvideoid).muted(false);
	}
	videoMuted=false;
	setVideoMuteIcon();
}

function setVideoMuteIcon(){
	if(activePlayer=='youtube' || activePlayer=='vimeo' || activePlayer=='videojs'){
		if(!mobileDevice)
			$('.footerBgVideoControls').css('display', 'inline-block');
		if(videoMuted){
			$('.muteVideo').hide();
			$('.unmuteVideo').css('display', 'inline-block');
		}else{
			$('.muteVideo').css('display', 'inline-block');
			$('.unmuteVideo').hide();
			
		}
	}else{
		$('.muteVideo').hide();
		$('.unmuteVideo').hide();
		$('.footerBgVideoControls').hide();
	}
}

/*Youtube Api Begin*/ 
var tag = document.createElement('script');
tag.src = "http://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubePlayerAPIReady() {
	ytPlayerReady = true;
}
function onPlayerReady(event) {
	if(!videoPaused && !mobileDevice)
		event.target.playVideo();
	if(videoMuted)
		videoMute();
	else
		videoUnMute();
}
var done = false;
function onPlayerStateChange(event) {
	if(event.data==YT.PlayerState.ENDED && bgPaused==false)
		nextBg();
	else if(event.data==YT.PlayerState.ENDED && videoLoop)
		event.target.playVideo();
}
function stopVideo() {
	ytplayer.stopVideo();
}
/*Youtube Api End*/ 
  
/*Vimeo Api Begin*/
var vmPlayerReady=false;
var vmplayer;
function vimeoApiReady(player_id){
	vmplayer = player_id;
	vmPlayerReady = true;
	$f(vmplayer).addEvent('finish', vimeoVideoEnded);
	if(!videoPaused){
		$f(vmplayer).api('play');
	}if(videoMuted)
		videoMute();
	else
		videoUnMute();
}
function vimeoVideoEnded(player_id){
	vmplayer = player_id;
	if(!bgPaused)
		nextBg();
	else if(videoLoop)
		$f(vmplayer).api('play')
}
/*Vimeo Api End*/  

function getParamsFromUrl(mediaURL){
	if(typeof mediaURL == 'undefined') return false;
	var params = new Array();
	if(mediaURL.indexOf('?')>-1){
		var url = mediaURL.substring(0, mediaURL.indexOf('?'));
		var query = mediaURL.substring(mediaURL.indexOf('?')+1, mediaURL.length);
	}else
		var url = mediaURL;
		
	params['vurl'] = url;
	var seperatedSlash = url.split('/');
	params['v'] = seperatedSlash[seperatedSlash.length-1];
	
	if(typeof query != 'undefined'){
		var qsSections = query.split('&');
		for(var i=0; i<qsSections.length; i++){
			var keyValue = qsSections[i].split('=');
			if(keyValue[0]!=undefined)
				params[keyValue[0]] = keyValue[1];
		}
	}
	
	return params;
}

function getMediaType(mediaUrl){
	if (mediaUrl.indexOf('youtu.be')>-1 || mediaUrl.indexOf('youtube.com/watch')>-1)
		return 'youtube';
	else if(mediaUrl.indexOf('vimeo.com')>-1)
		return 'vimeo';
	else{
		murl = parseURL(mediaUrl);
		var extensions = murl.file.split('.');
		if(extensions.length>1)
		{
				var le = extensions[extensions.length-1]
			le = le.toLowerCase();
			
			if(le=='flv' || le=='f4v' || le=='m4v' || le=='mov' || le=='mp4')
				return 'videojs';
			else
				return '';
		}else
			return '';
	}
}

function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
    };
}


function bgSoundMute(state){
	if(muteWhilePlayVideo && Modernizr.audio){
		if(state)
			doMute();
		else if(muteAudioChangedBy==''){
			doUnMute();
		}else if(muteAudioChangedBy!=''){
			if(muteAudioChangedStatus=='mute')
				doMute();
			else if(muteAudioChangedStatus=='unmute')
				doUnMute();
		}
	}
}


// Background Image Animation
var activePlayer = 'none';
function runBg(){
	if($('#bgImages li').length<1) return false;
	activeNo = 0;
	$('#bgImages li').each(function(index, value){
		if($(this).hasClass('active'))
			activeNo = index+1;
	});
	
	if(activeNo<10)
		activeNo = '0'+activeNo;
	$('.currentItemNo').text(activeNo);
	totalCount = $('#bgImages li').length;
	if(totalCount<10)
		totalCount = '0'+totalCount;
	$('.totalItemCount').text(totalCount);
	$('#mediaWrapper .source').removeClass('new').addClass('old');
	var mediaUrl = $('#bgImages li.active a').attr('href');
	if(getMediaType(mediaUrl)=='youtube' || getMediaType(mediaUrl)=='vimeo' || getMediaType(mediaUrl)=='videojs')
	{
		$('.pauseVideo').css('display', 'inline-block');
		$('.playVideo').hide();
		$('.muteVideo').css('display', 'inline-block');
		$('.unmuteVideo').hide();
		if(getMediaType(mediaUrl)=='youtube')
		{
			bgSoundMute(true);
			var mediaParams = getParamsFromUrl(mediaUrl);
			if(mobileDevice){
				$('#videoExpander').data('link', mediaUrl);
				$('#videoExpander').show();
			}
			if(ytPlayerReady)
			{
				activePlayer = 'youtube';
				$('#mediaWrapper').prepend($('<div id="ytVideo"><div id="ytVideoPlayer"></div></div>').addClass('new').addClass('source').css('opacity','0'));
				ytplayer = new YT.Player('ytVideoPlayer', {
				  height: mediaParams['height'],
				  width: mediaParams['width'],
				  videoId: mediaParams['v'],
				  playerVars: {
					controls: 1,
					showinfo: 0 ,
					modestbranding: 1,
					wmode: 'opaque'
				},
				  events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				  }
				});
			}
		}
		else if(getMediaType(mediaUrl)=='vimeo'){
			bgSoundMute(true);
			var mediaParams = getParamsFromUrl(mediaUrl);
			
			if(mobileDevice){
				$('#videoExpander').data('link', mediaUrl);
				$('#videoExpander').show();
			}

			activePlayer = 'vimeo';
			$('#mediaWrapper').prepend($('<div id="vmVideo"></div>').addClass('new').addClass('source').css('opacity','0'));
			$('#vmVideo').append($('<iframe id="vimeoplayer" width="'+mediaParams['width']+'" height="'+mediaParams['height']+'" src="http://player.vimeo.com/video/'+mediaParams['v']+'?api=1&amp;title=0&amp;byline=0&amp;portrait=0&autoplay=0&loop=0&controls=1&player_id=vimeoplayer" frameborder="0" webkitAllowFullScreen allowFullScreen></iframe>').attr('id', 'vimeoplayer'));
			$('#vmVideo iframe').each(function(){
				$f(this).addEvent('ready', vimeoApiReady);
			});
		}else if(getMediaType(mediaUrl)=='videojs'){
			bgSoundMute(true);
			var mediaParams = getParamsFromUrl(mediaUrl);
			activePlayer = 'videojs';
			var poster = '';
			if($.trim(mediaParams['poster'])!='')
				poster = mediaParams['poster'];
				
			if(!mobileDevice){
				$('#mediaWrapper').prepend($('<div id="jsP"></div>').addClass('new').addClass('source').css('opacity','0'));
				var html5videoid = 'html5_video_'+randomString(6);
				$('#jsP').append($('\
					<video id="'+html5videoid+'" class="video-js vjs-default-skin" controls preload="none" width="'+mediaParams['width']+'" height="'+mediaParams['height']+'"\
					  poster="'+poster+'"\
					  data-setup="{}">\
					<source src="'+mediaParams['vurl']+'" type="video/mp4" />\
				  </video>\
				'));
				var htmlvideoid = $('#jsP .video-js').attr('id');
				videojs(htmlvideoid).ready(function(){
					this.on("ended", function(){
						if(bgPaused==false){
							nextBg();
						}else if(videoLoop){
							this.currentTime(0);
							this.play();
						}else{
							this.posterImage.show();
						}
					});
					if(!videoPaused && !mobileDevice)
						this.play();
					if(videoMuted)
						videoMute();
					else
						videoUnMute();
				});
			}else{
				$('#videoExpander').data('link', mediaUrl);
				$('#videoExpander').show();
				$('#mediaWrapper').prepend($('<div id="jsP"><img src="'+poster+'" class="video-js" style="position:absolute;left:0;top:0;" width="'+mediaParams['width']+'" height="'+mediaParams['height']+'"></div>').addClass('new').addClass('source').css('opacity','0'));
			}
		}
		
		bgRunning = true;
		clearInterval(bgTimer);
		doSize();
		runBgAni();
	}else{
		bgSoundMute(false);
		activePlayer = 'none';
		bgRunning = true;
		showBgImageLoading();
		$('#mediaWrapper').prepend($('<img src="'+$('#bgImages li.active a').attr('href')+'" />').addClass('new source').css('opacity','0'));
		$('#mediaWrapper img.new').load(function(){
			$(this).css('opacity', '0');
			$(this).attr('owidth', $(this).naturalWidth());
			$(this).attr('oheight',$(this).naturalHeight());
			$(this).attr('width', $(this).width());
			$(this).attr('height', $(this).height());
			doSize();
			clearInterval(bgTimer);
			hideBgImageLoading();
			runBgAni();
		}).error(function(){
			bgRunning = false;
			hideBgImageLoading();
			nextBg();
		}).dequeue();
		if(mobileDevice)
			$('#videoExpander').hide();
		setVideoMuteIcon();
	}
	
}

// adds .naturalWidth() and .naturalHeight() methods to jQuery
// for retreaving a normalized naturalWidth and naturalHeight.
(function($){
	var
	props = ['Width', 'Height'],
	prop;

	while (prop = props.pop()) {
		(function (natural, prop) {
			  $.fn[natural] = (natural in new Image()) ? 
			  function () {
				return this[0][natural];
			  } : 
			  function () {
				  var 
				  node = this[0],
				  img,
				  value;

				  if (node.tagName.toLowerCase() === 'img') {
					img = new Image();
					img.src = node.src,
					value = img[prop];
				  }
				  return value;
			  };
		}('natural' + prop, prop.toLowerCase()));
	}
}(jQuery));

var bgImageLoadingRunning = false;
function showBgImageLoading(){
	$('.bgImageLoading').show().animate({opacity:1}, 500);
	bgImageLoadingRunning = true;
}
function hideBgImageLoading(){
	$('.bgImageLoading').animate({opacity:0}, 500, function(){
		$(this).hide();
	});
	bgImageLoadingRunning = false;
}

function runBgAni(){
	clearInterval(bgTimer);
	
	// bg Text animation
	$('#bgText .subTextWrapper').stop(true).animate({opacity:0}, 800 , 'easeOutQuad');
	$('#bgText .headerTextWrapper').stop(true).animate({opacity:0}, 800 , 'easeOutQuad', function(){
		

		if($.trim($('#bgImages li.active h3').text())!=''){
			$('#bgText .headerText').html($('#bgImages li.active h3').html());
			$('#bgText .headerTextWrapper, #bgText .headerText').css('width', 'auto');
			var headerTextW = $('#bgText .headerTextWrapper').outerWidth();
			$('#bgText .headerText').css({width:headerTextW-10});
			$('#bgText .headerTextWrapper').css({width:'0px'});
			$('#bgText .headerTextWrapper').animate({opacity:1, width:headerTextW}, {queue:true, duration:500, easing:'easeOutQuad', complete:function(){
				$('#bgText .headerTextWrapper').css({width:'auto'});
				$('#bgText .headerText').css({width:'auto'});
			}});
		}else{
			$('#bgText .headerText').html('');
		}
		
		if($.trim($('#bgImages li.active p').html())!=''){
			$('#bgText .subText').html($('#bgImages li.active p').html());
			$('#bgText .subTextWrapper, #bgText .subText').css('width', 'auto');
			var subTextW = $('#bgText .subTextWrapper').outerWidth();
			$('#bgText .subText').css({width:subTextW-10});
			$('#bgText .subTextWrapper').css({width:'0px'});
			$('#bgText .subTextWrapper').delay(400).animate({opacity:1, width:subTextW}, {queue:true, duration:500, easing:'easeOutQuad', complete:function(){
				$('#bgText .subTextWrapper').css({width:'auto'});
				$('#bgText .subText').css({width:'auto'});
			}});
		}else{
			$('#bgText .subText').html('');
		}
	});
	
	// remove previous media
	if($('#mediaWrapper .old').length>0)
	{
		$('#mediaWrapper .old').stop(true).animate({opacity:0}, 500, function(){
			if($('#jsP .video-js').lengh>0){
				var htmlvideoid = $('#jsP .video-js').attr('id');
				videojs(htmlvideoid).dispose();
			}
			$(this).remove();
			bgRunning = false;
		});
	}else{bgRunning = false;}
	
	// animate next media
	if(!NormalFade){
		$('#mediaWrapper .new').css('opacity', '1');
		if(activePlayer=='none' && !useFullImage){
			var beforeAniLeft = $('#mediaWrapper .new').css('left');
			$('#mediaWrapper .new').css('left', '-'+$('#mediaWrapper .new').width()+'px');
			$('#mediaWrapper .new').animate({left:beforeAniLeft},600, 'easeOutQuad');
		}
	}else{
		$('#mediaWrapper .new').css('opacity', '0');
			$('#mediaWrapper .new').animate({opacity:'1'},600, 'easeOutQuad');
	}
	clearInterval(timecircleTimer);
	bgTimeCurrent = 0;
	setBgTimer();
}


function setBgTimer(){
	if(bgTime>0 && bgPaused==false && (activePlayer == 'none' || mobileDevice)){
		timecircleTimer = setInterval(timecircle, 20);
		bgTimer = setInterval(autoBg, bgTime);
		bgTimeCurrent = 0;
	}else{
		clearInterval(timecircleTimer);
		bgTimeCurrent = 0;
	}
}

var timecircleTimer, bgTimeCurrent;
function timecircle(){
	if(!bgImageLoadingRunning){
		bgTimeCurrent += 20;
		timePer = bgTimeCurrent/bgTime;
		$('#mediaTimer').css('width', (timePer*100)+'%');
	}
}

// Open Inner Page
function openPage(getURL, reload){
	if(typeof getURL == 'undefined') return false;
	if(typeof reload == 'undefined') reload = false;
	if(getURL.substr(0,1)=='#') return false;
	if(getURL.substr(getURL.length-1,1) == '#') return false;
	
	
	
	$("#contentBox").getNiceScroll().remove();
	$(document).unbind('contentPageReady');
	$(document).unbind('contentPageAniOnComplate');

	subMenuDoClose($('ul.menu'));
	
	// remove it if first character / 
	if(getURL.substr(0,1)== '/')  getURL = getURL.substr(1,getURL.length);
	
	// action stop for some cases
	if(pageLoading || getURL.indexOf('gallery[')>-1 || getURL.substr(0,1)=='#'){
		return false;
	}
	
	
	// remove hash
	var hasindex = getURL.indexOf('#');
	if(hasindex>-1){
		getURL = getURL.substr(0,hasindex);
	}
	var pageLoadingURL = $.trim(getURL);
	
	pageLoading = true;
	
	// Google Analytics action for ajax pages
	if(typeof _gaq != 'undefined'){
		var suburl = pageLoadingURL;
		if(suburl=='/' || suburl == '//') suburl = '';
		suburl = window.location.pathname+suburl;
		_gaq.push(['_trackPageview', suburl]);
	}

	// don't load ajax at direct access
	if(pageLoadingURL==''){
		showLoading();
		pageLoaded();
		return false;
	}
	
	if($(document).width()<=768){
		closeMainMenu();
	}
	
	if(mobileDevice)
		$('#menu-wrapper').css('top', '0');
	
	
	if($.trim($('#content').html())=='')
	{
		loadPage(pageLoadingURL, reload);
	}else{
		$('#content').width($('#content').width());
		var tempRight = $('#content').css('right');
		$('#content').css('right', 'auto');
		
		$('#contentContainer').animate({opacity:0}, 600, 'easeOutExpo');
		$('#content').animate({opacity:'0', marginLeft:100}, 600, 'easeOutExpo', function(){
			$('#content').css('width', 'auto');
			$('#content').css('right', tempRight);
			$('#content').hide();
			loadPage(pageLoadingURL, reload);
			setCaptionPosition();
		});
	}	
	return false;
}

function loadPage(pageLoadingURL, reload){
	showLoading();
	$.ajax({'url':pageLoadingURL, type:'post', udata:pageLoadingURL, ureload:reload, success:function(data){
		var $htmlPage = $('<html />').html(data);
		var content = $htmlPage.find('#content').html();
		var title = $htmlPage.find('title').html();
		var imageContainer = $htmlPage.find('#bgImagesContainer').html();
		
		// Content
		$('#content').html(content);
		$('#contentBoxContainer img').imagesLoaded(function(){
			pageLoaded();
			
			// Bg Images Thumbs
			$('#videoExpander').hide();
			imageContainer = $.trim(imageContainer);
			if(imageContainer!=''){
				var galleryID = parseInt($(imageContainer).data('gallery-id'));
				if(galleryID!=0){
					var currentGalleryID = parseInt($('#bgImages').data('gallery-id'));
					if(galleryID != currentGalleryID)
					{
						$('#bgImages').data('gallery-id', $(imageContainer).data('gallery-id'));
						$('#bgImages').html($(imageContainer).html());
						$('#bgImages').imagesLoaded(function(){
							galleryThumbs();
							galeriThumbsHorizontalMove();
						});
					}
				}else
					removeAllBgImages();
			}else
				removeAllBgImages();
			setGalleryStatus();

		});
		
		// Title
		if(Modernizr.history && historyApiEnable){
			if(reload){
				history.pushState(null, title, pageLoadingURL);
			}
		}
		if(!$.browser.msie)
			$('title').html(title);
	} });
}

// Inner Page Loaded Actions
function pageLoaded(){
	hideLoading();
	menuMobileOpened = false;	
	pageLoading = false;
	if( !$.trim($('#contentBoxContainer').html())=='' ){
		jQuery.event.trigger("contentPageReady", null, document, false, null);	
		showBgCaption = false;
		setCaptionPosition();
		
		$('#content').css({opacity:0, display:'block', right:0, marginLeft:0});
		$('#content').width($('#content').width());
		$('#content').css({right:'auto', marginLeft:100});
		$('#content').delay(500).animate({marginLeft:0, opacity:1}, 600, 'easeOutExpo', function(){
			$('#content').css('right',0);
			$('#content').css('width','auto');
		});
		$('#contentContainer').stop(true).delay(500).animate({opacity:'1'}, 600, 'easeOutExpo', function(){
			jQuery.event.trigger("contentPageAniOnComplate", null, document, false, null);
			pageBehaviors();
			pageAniCompleteActions();
		});
	}else{
		$('#content').hide();
		pageBehaviors();
	}
	
	if(firstPage)
		setGalleryStatus();
	
	
	firstPage = false;
}

function setGalleryStatus(){
	var galleryID = parseInt($('#bgImages').data('gallery-id'));
	if(galleryID>0){
		$('.footerBgControls').css('display', 'inline-block');
		if( $.trim($('#contentBoxContainer').html())=='' || $.trim($('#content').html())=='' ){
			if($('#contentContainer').hasClass('FullPageGallery'))
				changeMode(true,true);
			else
				galleryControls(true, 'show');
		}else{
			galleryControls(false, 'show');
		}
		if(mobileDevice)
			$('#thumbOpener').show();
	}else{
		$('.footerBgControls').hide();
		galleryControls(false, 'hide');
		$('#thumbOpener').hide();
	}
}

function removeAllBgImages(){
	$('#bgImages').data('gallery-id', '0');
	$('#bgImages li').remove();
	$('#mediaWrapper .source').animate({opacity:0}, {duration:500, complete:function(){
		$('#mediaWrapper').html('');
	}});
	galleryThumbs();
}


function resizeIsotope(){
	if($('.isotope-portfolio').hasClass('isotope'))
		$('.isotope-portfolio').isotope('reLayout');
		
	if($('.isotope-gallery').hasClass('isotope'))
		$('.isotope-gallery').isotope('reLayout');
		
	var $pcontainer = $('.isotope-project');
	if($pcontainer.hasClass('isotope')){
		if($pcontainer.data('style')=='masonry'){
			$pcontainer.isotope({
				masonry: { 
					columnWidth: calculateColWidth()
				}
			});
		}else{
			$pcontainer.isotope({
				fitRows: { 
					columnWidth: calculateColWidth()
				}
			});
		}
	}
	
	var $bcontainer = $('.isotope-blog');
	if($bcontainer.hasClass('isotope')){
		$bcontainer.isotope({
			masonry: { 
				columnWidth: calculateBlogColWidth()
			}
		});
	}
}
function pageAniCompleteActions(){
	$("#contentBox").scrollTop(0);
	
	$(window).off('smartresize.isotope');
	$(window).sresize(function(){
		resizeIsotope();
	});

	setLink();
	setScroll();
	firstPortfolioAnimation = true;
	portfolioIsotope();
	firstGalleryAnimation = true;
	galleryIsotope();
	firstProjectAnimation = true; 
	projectIsotope();
	firstBlogAnimation = true;
	blogIsotope();
	blogloadmore();
	setImageAnimations();
	setImageModal();
}

function setLink(){
	if(Modernizr.history && historyApiEnable)
		setHistoryLinks(new Array('#content'));
}
function setScroll(){
	if($('#contentContainer').hasClass('Invisible') && ( $('#contentContainer').hasClass('Left') || $('#contentContainer').hasClass('Right') || $('#contentContainer').hasClass('Centered') ) ){
		$("#contentBox").niceScroll( {cursorcolor:$('#REF_ColorFirst').css('color'), cursoropacitymin:.2, cursorborder:'none', cursorborderradius:'none', cursorwidth:8, autohidemode:true, railpadding:{top:0,right:-20,left:0,bottom:0}});	
	}else{
		$("#contentBox").niceScroll( {cursorcolor:$('#REF_ColorFirst').css('color'), cursorborder:'none', cursorborderradius:'none', cursorwidth:8, autohidemode:true, railpadding:{top:0,right:0,left:0,bottom:0}});
	}
}
function portfolioIsotope(){
	/* isotope portfolio */
	$('.isotope-portfolio .portfolio-item-container').css({left:50});
	$('.isotope-portfolio').isotope({
		layoutMode: "perfectMasonry",
		itemSelector: '.portfolio-item',
		perfectMasonry: {
			liquid: true
		}
	},function(){
		if(firstPortfolioAnimation){
			$('.isotope-portfolio .portfolio-item-container').each(function(i,n){
				$(this).cssanimate({left:0, opacity:1},{duration:300, delay:(100*i)});
			});
		}
		firstPortfolioAnimation = false;
	});
	
	$('.isotope-filter a').click(function(event){
		event.stopPropagation();
		event.preventDefault();
		$(this).parent().parent().find('.selected').removeClass('selected');
		$(this).addClass('selected');
		var selector = $(this).data('filter');
		$('.isotope-portfolio').isotope({ filter: selector });
	});
	
	$('.isotope-filter-menu').hover(function(){
		$(this).css({width:'auto'});
		$(this).find('a').css({display:'block'});
		var totalW = $(this).outerWidth();
		totalW += 10;
		$(this).find('a:not(.selected)').css({display:'none'});

		$(this).stop().animate({width:totalW}, {queue:false, ease:'easeOutQuint', duration:300, complete:function(){
			$(this).find('a:not(.selected)').css({display:'block'}).css({opacity:0});
			$(this).find('a').each(function(i,n){
				$(this).delay(i*50).animate({opacity:1}, {queue:true, ease:'easeOutQuint', duration:200});
			});
		} });
	}, function(){
		var currentWidth = $(this).outerWidth();
		$(this).find('a:not(.selected)').css({display:'none'});
		$(this).css({width:'auto'});
		var nextWidth = $(this).outerWidth();
		$(this).find('a:not(.selected)').css({display:'block'});
		$(this).css({width:currentWidth});
		$(this).find('a:not(.selected)').each(function(i,n){
			$(this).stop().delay(i*50).animate({opacity:0}, {queue:true, ease:'easeOutQuint', duration:200, complete:function(){
					$(this).css({display:'none'});
				}
			});
		});
		$(this).stop().delay(($(this).find('a:not(.selected)').length*50)+250).animate({width:nextWidth}, {queue:true, ease:'easeOutQuint', duration:300});
	});
	
}

function galleryIsotope(){
	/* isotope gallery */
	$('.isotope-gallery .gallery-item-container').css({left:50});	
	$('.isotope-gallery').isotope({
		layoutMode: "perfectMasonry",
		itemSelector: '.gallery-item',
		perfectMasonry: {
			liquid: true
		}
	},function(){
		if(firstGalleryAnimation){
			$('.isotope-gallery .gallery-item-container').each(function(i,n){
				$(this).cssanimate({left:0, opacity:1},{duration:300, delay:(100*i)});
			});
		}
		firstGalleryAnimation = false;
	});
}

function projectIsotope(){
	/* projects */
	var $pcontainer = $('.isotope-project');
	$pcontainer.find('.project-item-container').css({top:50, opacity:0});
	if($pcontainer.data('style')=='masonry'){
		$pcontainer.isotope({
			itemSelector: '.project-item',
			masonry: { 
				columnWidth: calculateColWidth(),
				gutterWidth: 15  
			}
		},function(){
			if(firstProjectAnimation){
				$pcontainer.find('.project-item-container').each(function(i,n){
					$(this).cssanimate({top:0, opacity:1},{duration:300, delay:(100*i), removetransion:true});
				});
				setTimeout(resizeIsotope, 50);
			}
			firstProjectAnimation = false;
		});
	}else{
		$pcontainer.isotope({
			itemSelector: '.project-item',
			layoutMode : 'fitRows',
			fitRows: { 
				columnWidth: calculateColWidth(),
				gutterWidth: 15  
			}
		},function(){
			if(firstProjectAnimation){
				$pcontainer.find('.project-item-container').each(function(i,n){
					$(this).cssanimate({top:0, opacity:1},{duration:300, delay:(100*i), removetransion:true});
				});
				setTimeout(resizeIsotope, 50);
			}
			firstProjectAnimation = false;
		});
	}
	
	// Filter
	$('.project-filter a').click(function(event){
		event.stopPropagation();
		event.preventDefault();
		$(this).parent().parent().find('.selected').removeClass('selected');
		$(this).addClass('selected');
		var selector = $(this).data('filter');
		$('.isotope-project').isotope({ filter: selector });
	});

}

function blogIsotope(){
	var $bcontainer = $('.isotope-blog');
	$bcontainer.find('.blogitem-container').css({top:50, opacity:0});
	$bcontainer.isotope({
		itemSelector: '.blogitem',
		masonry: { 
			columnWidth: calculateBlogColWidth(),
			gutterWidth: 15
		}
	},function(){
		setTimeout(function(){
			if(firstBlogAnimation){
				animateBlogItems($bcontainer.find('.blogitem-container'));
			}
			firstBlogAnimation = false;
		}, 500);
	});
}

function animateBlogItems($obj){
	$obj.each(function(i,n){
		$(this).cssanimate({top:0, opacity:1}, {duration:300, delay:(100*i)}).addClass('animated');
	});
}

function calculateBlogColWidth(){
	var $container = $('.isotope-blog');
	var colcount =  3;
	if( $container.width()<=720){
		colcount = (colcount>=4)?3:colcount;
	}
	if( $container.width()<=650){
		colcount = (colcount>=3)?2:colcount;
	}
	if( $container.width()<=360){
		colcount = (colcount>=2)?1:colcount;
	}
	var colWidth = Math.floor(( $container.width()-((colcount-1)*15))/colcount);
	$container.find('.blogitem').width(colWidth);
	return colWidth;
}

function calculateColWidth(){
	var $container = $('.isotope-project');
	var colcount =  $container.data('col-count');
	if( $container.width()<=720){
		colcount = (colcount>=4)?3:colcount;
	}
	if( $container.width()<=650){
		colcount = (colcount>=3)?2:colcount;
	}
	if( $container.width()<=360){
		colcount = (colcount>=2)?1:colcount;
	}
	var colWidth = Math.floor(( $container.width()-((colcount-1)*15))/colcount);
	$container.find('.project-item').width(colWidth);
	return colWidth;
}

function pageBehaviors(){
	$('#mainmenu .front').mouseover(function(){
		if(Modernizr.audio){
			if(btnSound.currentTime!=0){
				btnSound.pause();
				btnSound.currentTime=0;
			}
			btnSound.play();
		}
	});
		
	$('a[data-toggle="tooltip"]').tooltip();
	$('a[data-toggle="popover"]').popover();
	
	$('a[data-toggle="tooltipfooter"]').tooltip();
	$('a[data-toggle="tooltipfooter"]').on('hover', function () {
		$('.tooltip').css({marginTop:'-10px'});
	})
	
	$('#contentBox a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		e.target 
		e.relatedTarget
	});	
	
	$('.accordition-toggle').on('shown.bs.collapse', function (e) {
		$(this).find('.panel-collapse.in').parents('.panel').addClass('active');
	}).on('hidden.bs.collapse', function (e) {
		$(this).find('.panel-collapse').not('.in').parents('.panel').removeClass('active');
	})
	
	$('.accordition-toggle .tab-toggle').click(function(){
		$(this).parents('.panel').find('a[data-toggle="collapse"]').trigger('click');
	});
	
	$('.testimonial_container').each(function(){
		var $tc = $(this);
		$tc.find('.testimonial_item:first-child').addClass('active')
		.end().find('.testimonial_item:not(.active)').css({display:'none', opacity:0});
		$tc.find('.testimonial_next').click(function(){
			if($tc.find('.testimonial_item.active').next().length>0)
				$tc.find('.testimonial_item.active').next().addClass('active').end().removeClass('active').addClass('remove');
			else
				$tc.find('.testimonial_item.active').removeClass('active').addClass('remove').end().find(':first-child').addClass('active');
			showTestimonial($tc);
		});
		$tc.find('.testimonial_prev').click(function(){
			if($tc.find('.testimonial_item.active').prev().length>0)
				$tc.find('.testimonial_item.active').prev().addClass('active').end().removeClass('active').addClass('remove');
			else
				$tc.find('.testimonial_item').removeClass('active').addClass('remove').end().find(':last-child').addClass('active');
			showTestimonial($tc);
		});
	});
	function showTestimonial($tc){
		var removeHeight = $tc.find('.testimonial_item.remove').height();
		$tc.find('.testimonial_item.remove').css({display:'none'}).end().find('.testimonial_item.active').css({display:'block'});
		var activeHeight = $tc.find('.testimonial_item.active').height();
		$tc.find('.testimonial_item.remove').css({display:'block'}).end().find('.testimonial_item.active').css({display:'none'});
		$tc.find('.testimonial_wrapper').animate({height:activeHeight}, {queue:false, duration:600, complete:function(){}});
		$tc.find('.testimonial_item.remove').animate({opacity:0}, {queue:false, duration:300, complete:function(){
			$(this).css({display:'none'}).removeClass('remove');
			$tc.find('.testimonial_item.active .testimonial_owner').css({top:'100%', opacity:0});
			$tc.find('.testimonial_item.active').css({display:'block', opacity:0}).animate({opacity:1}, {queue:false, duration:300, complete:function(){
				$tc.find('.testimonial_item.active .testimonial_owner').css({opacity:1}).animate({top:'0%'}, {queue:false, duration:300, complete:function(){
					$tc.find('.testimonial_wrapper').css({height:'auto'});
				}});
			}});
		}});
	}
	
	$('.knob').each(function(){
		var content = $.trim($(this).data('content'));
		if(content!=''){
			$(this).knob({
			  'draw' : function () { 
				$(this.i).val(content);
			  }
			});
		}else{
			$(this).knob();
		}
	});
	
	$('.person').each(function(){
		var $p = $(this);
		$p.hover(function(){
			$p.find('.person-social').css({top:'-50%'}).animate({top:'0%'}, {queue:false, duration:300});
			$p.find('.person-title').css({bottom:'-50%'}).animate({bottom:'0%'}, {queue:false, duration:300});
		}, function(){
			$p.find('.person-social').animate({top:'-50%'}, {queue:false, duration:300});
			$p.find('.person-title').animate({bottom:'-50%'}, {queue:false, duration:300});
		});
	});
	
	$('.lightbox').each(function(){
		$(this).find('a').addClass('modalimage').unbind('click');
		setImageModal($(this));
	});
	
	/* Set Google Map */
	$('.gmap').each(function(){
		if($(this).data('width')!='')
			$(this).css('width', $(this).data('width'));
		if($(this).data('height')!='')
			$(this).css('height', $(this).data('height'));
			
		var infoBoxMessage='';
		if($(this).find('> span').length==1){
			infoBoxMessage = $(this).find('> span').html();
		}
		var latlng = new google.maps.LatLng($(this).data('lat'), $(this).data('lng'));
		var controls = ($.trim($(this).data('controls'))=='true')?false:true;
		myOptions = { "zoom": $(this).data('zoom'), "disableDefaultUI":controls , "mapTypeId":$(this).data('maptype')};
		myOptions.center = latlng;
		var mapObjName = new google.maps.Map($(this)[0], myOptions);
		var markerName = new google.maps.Marker({
			map: mapObjName, 
			position: mapObjName.getCenter()
		});
		if(infoBoxMessage!=''){
			var infowindowName = new google.maps.InfoWindow();
			infowindowName.setContent(infoBoxMessage);
			google.maps.event.addListener(markerName, 'click', function() {
				infowindowName.open(mapObjName,  markerName);
			});
		}
	});
	
	/* Form */
	$('.rb_form input, .rb_form textarea').focus(function(){
		$(this).parents('.input-group').find('.input-group-addon').addClass('active-addon');
	}).blur(function(){
		$(this).parents('.input-group').find('.input-group-addon').removeClass('active-addon');
	});
	
	$(".rb_form input, .rb_form select, .rb_form textarea").not("[type=submit]").jqBootstrapValidation();
	 
	$(".rb_form form").submit(function(){
		var $form = $(this);
		var formdata = $form.serialize();

		$form.slideUp();
		$form.parent().append('<div class="form-message"><i class="fa fa-spinner fa-spin"></i> Please wait...</div>').find(".form-message").slideDown("slow");
		$.post('form-sender.php', formdata, function(data){
			data = $.parseJSON(data);
			if(data.status=="OK")
			{
				$form.parent().find(".form-message").html(data.message);
			}else{
				alert(data.ERR);
				$form.slideDown();
				$form.parent().find(".form-message").remove();
			}
		});
		return false;
	});
	
	if(Modernizr.history && historyApiEnable){
		$('#searchform').unbind('submit').attr('onsubmit','');
		$('#searchform').submit(function(){
			//openPage('/?s='+$('.searchbox').val(), true);
			return false;
		});
	}
	
	$('.embed-videojs').each(function(){
		videojs($(this).attr('id'));
		$(this).animate({opacity:1}, 300);
		$(this).parent().animate({opacity:1}, 300);
	});
	
	$("#contentBox").fitVids();
	
	// First Load FlexSlider
	applyFlexSlider('#contentBox .flexslider');
}


	
/* Flex Slider */
function applyFlexSlider(target){
	$(target).each(function(){
		var controlNav = ($.trim($(this).data('controlnav'))=='true')?true:false;
		$(this).flexslider({
			animationLoop: true,
			controlNav: controlNav,
			smoothHeight:false,
			touch: true,
			useCSS: false,
			prevText:'',
			nextText:'',
			pauseOnAction: true,
			pauseOnHover: true 
		});
	});
}

function setImageModal(target){
	var $obj = (typeof target == 'undefined')?$('#contentBox'):target;
	var modalid = randomString(5);
	$obj.find('.modalimage').not('.nomodal').attr('rel','gallery[photo'+modalid+']');
	$obj.find('a[rel^="gallery["]').not('.nomodal').click(function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		var $imgobj = $(this);
		if(tempThumbs=='')
			tempThumbs = $('#bgImages').html();
		if(tempActive=='')
			tempActive = $('#bgPlayer').html();
		tempbgPaused = bgPaused;
		pauseBg();		
		$('#bgImages li').remove();
		ytplayer = null;
		var allthumbs='';
		$obj.find('a[rel="'+$imgobj.attr('rel')+'"]').not('.nomodal').each(function(){
			var addCaption = '';
			var addDescription = '';
			if($.trim($(this).find('.hoverHeader').html())!='')
				addCaption = '<h3>'+$(this).find('.hoverHeader').html()+'</h3>';
			if($.trim($(this).find('.hoverDescription').html())!='')
				addDescription = '<p>'+$(this).find('.hoverDescription').html()+'</p>';
			
			var mediaType = getMediaType($(this).attr('href'));
			if(! ((mediaType=='youtube' || mediaType=='vimeo' || mediaType=='flash') && mobileDevice && videoSkipMobile) )
				allthumbs += '<li><a href="'+$(this).attr('href')+'"><img class="thumb" src="'+$(this).find('img').attr('src')+'" /></a>'+addCaption+addDescription+'</li>';
		});
		$('#bgImages').prepend(allthumbs);
		$('#bgImages').imagesLoaded(function(){
			galleryThumbs($imgobj.attr('href'), 'fit');
		});
		return false;
	});
}

function setImageAnimations(){
	// Hover Animations
	$('.portfolio-item a, .project-item a, .gallery-item a, .blog-media a.hoverani').each( function() { $(this).hoverdir(); } );
	
	$('.clickable').click(function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		if(Modernizr.history && historyApiEnable)
			openPage($(this).data('link'), true);
		else
			window.location = $(this).data('link');
		return false;
	});
	
	$('.hoverable').each(function(){
		$(this).hover(function(){
			if($(this).data('mouseout'))
				$(this).removeClass($(this).data('mouseout'));
			if($(this).data('mouseover')){
				$(this).removeClass($(this).data('mouseover'));
				$(this).addClass($(this).data('mouseover'));
			}
		},function(){
			if($(this).data('mouseout'))
				$(this).addClass($(this).data('mouseout'));
			if($(this).data('mouseover'))
				$(this).removeClass($(this).data('mouseover'));
		});
	});

	$(".portfolio-item .hoverIconHeart").click(function(event){
		event.preventDefault();
		event.stopImmediatePropagation();
		var heart = $(this);
	
		return false;
		// Retrieve post ID from data attribute
		post_id = heart.data("post-id");
		
		// Ajax call
		$.ajax({
			type: "post",
			url: '',
			data: "post_like=&post_id="+post_id,
			success: function(count){
				// If vote successful
				if(count != "already")
				{
					heart.find('.hoverIconHeartLike').text(count);
					heart.addClass('votedIcon');
				}
			}
		});
		
		return false;
	});
	
	$(".project-item .hoverIconHeart").click(function(event){
		event.preventDefault();
		event.stopImmediatePropagation();
		var heart = $(this);
	
		return false;
		// Retrieve post ID from data attribute
		post_id = heart.data("post-id");
		
		// Ajax call
		$.ajax({
			type: "post",
			url: '',
			data: "post_like=&post_id="+post_id,
			success: function(count){
				// If vote successful
				if(count != "already")
					heart.parents('.project-item').find('.project-like').addClass('project-liked').text(count);
			}
		});
		
		return false;
	});
	
	$(".bloglikelink").click(function(event){
		event.preventDefault();
		event.stopImmediatePropagation();
		var heart = $(this);
	
		return false;
		// Retrieve post ID from data attribute
		post_id = heart.data("post-id");
		
		// Ajax call
		$.ajax({
			type: "post",
			url: '',
			data: "post_like=&post_id="+post_id,
			success: function(count){
				// If vote successful
				if(count != "already"){
					heart.parents('.rb_meta_links').find('.bloglike').addClass('blogvotedIcon')
					heart.parents('.rb_meta_links').find('.bloglikelink').text(count);
				}
			}
		});
		
		return false;
	});


}

function subMenuDo(obj){
	clearTimeout(subMenuTimer);
	if(typeof(obj)!='undefined'){
		if($(obj).parent().find('> ul').length>0){
			subMenuDoOpen($(obj).parent());
		}else{
			subMenuDoClose($(obj).parent().parent());
		}
	}else{
		subMenuDoClose($('ul.menu'));
	}
}

function subMenuDoOpen(obj){
	if(($(document).width()<=768)){
		setTimeout(function(){
			$(obj).find('> ul').css({opacity:1, display:'block', marginLeft:0});
			$(obj).find('> ul >li').css({opacity:1});
			$(obj).find('> ul >li').css(getCssProperty('prefix')+'transform', 'none');
		}, 500);
	}else{
		$(obj).find('> ul').stop(true,true).css({opacity:1, marginLeft:5, display:'block'});
		
		$(obj).find('> ul >li').each(function(i,n){
			if(Modernizr.csstransitions)
				$(this).cssanimate({transform:'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -20, 0, 1)', opacity:'1'}, {duration:300, delay:i*100, removetransion:false});
			else{
				$(this).delay(i*100).animate({opacity:1}, 300);
			}
		});
	}
	subMenuDoClose($(obj).parent(), $(obj).attr('id'));
}
function subMenuDoClose(obj, except){
	var subquery = 'ul'
	if(typeof(except)!='undefined') subquery = 'li:not([id='+except+']) > ul';
	$(obj).find(subquery).each(function(){
		var activeObj = this;
	
		if($(document).width()>768){
			var lasti = $(activeObj).find('> li').length-1;
			$(activeObj).stop().delay( (lasti+1)*100).animate({opacity:0}, 300, function(){
			
				$(this).css({marginLeft:-5000});
				
				$(this).find('> li').each(function(i,n){
					if(Modernizr.csstransitions)
						$(n).cssanimate({transform:'matrix3d(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1) ', opacity:'0'}, {duration:300, delay:i*100, removetransion:false, complete:function(){}});
					else{
						$(n).delay(i*100).animate({opacity:0}, 300);
					}
				});
			});
		}else{
			//$(this).css({display:'none'});
			$(activeObj).animate({opacity:0}, 300, function(){
				$(this).css({display:'none'})
			});
		}
	});
}
 
// Main Menu Show Animation
function showMenu(){
	$('ul.menu  li  a').hover(function(){
			if(Modernizr.csstransitions){
				$(this).find('.front').cssanimate({ 'transform':' matrix3d(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, -40, 0, 1) ', opacity:'0'}, {duration:300, ease:'ease-in'});
				$(this).find('.back').cssanimate({'transform':' matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -40, 0, 1) ', opacity:'1'}, {duration:300, ease:'ease-in'});
			}else{
				$(this).find('.front').animate({opacity:0}, 300);
				$(this).find('.back').animate({opacity:1}, 300);
			}
		}, function(){
			if(Modernizr.csstransitions){
				$(this).find('.front').cssanimate({'transform':' matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0,  0, 1, 0, 0, 0, 0, 1) ', opacity:'1'}, {duration:300, ease:'ease-in'});
				$(this).find('.back').cssanimate({'transform':' matrix3d(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1) ', opacity:'0'}, {duration:300, ease:'ease-in'});
			}else{
				$(this).find('.front').animate({opacity:1}, 300);
				$(this).find('.back').animate({opacity:0}, 300);
			}
	});
	$('ul.menu li').each(function(i,el){
		if(!Modernizr.touch){
			$(el).find('> a').hover(function(e){
				clearTimeout(mainmenutimer);
				subMenuDo(this);
			}, function(){
				subMenuTimer = setTimeout(subMenuDo, 500);
			});
		}else{
			$(el).find('> a').hammer({prevent_default:false}).on("tap", function(e){
				subMenuDo(this);
			});
		}
	});
}

function setCaptionPosition(){
	if(showBgCaption)
		$('#bgText').stop().animate({opacity:'1'}, 500, 'easeOutQuad');
	else
		$('#bgText').stop().animate({opacity:'0'}, 500, 'easeOutQuad');
}

/*Time Bar*/
function playerBarMouseDown(event){
	$(document).bind('selectstart dragstart', rFalse);
	var firstX = event.pageX-$('#playerBar').offset().left;
	setBarPosition(firstX);
	$(document).bind('mousemove', {pageX:event.pageX, firstWidth:firstX}, playerMouseMove);
	$(document).bind('mouseup', playerMouseUp);
	$('#playerBar').unbind('mousedown', playerBarMouseDown);
}
function playerMouseMove(event){
	var newWidth = event.data.firstWidth+(event.pageX-event.data.pageX);
	if(newWidth<0)
		newWidth=0;
	if(newWidth>$('#playerBar').width())
		newWidth=$('#playerBar').width();
	
	setBarPosition(newWidth);
}
function playerMouseUp(event){
	$(document).unbind('selectstart dragstart', rFalse);
	$(document).unbind('mousemove', playerMouseMove);
	$(document).unbind('mouseup', playerMouseUp);
	$('#playerBar').bind('mousedown', playerBarMouseDown);
}
function setBarPosition(barX){
	if(!myAudio.paused){
		var posW=parseInt((myAudio.duration/$('#playerBar').width())*barX);
		myAudio.currentTime = posW;
	}
}

/*Volume Bar*/
function volumeBarMouseDown(event){
	$(document).bind('selectstart dragstart', rFalse);
	var firstX = event.pageX-$('#volumeBar').offset().left;
	setVolumeBarPosition(firstX);
	$(document).bind('mousemove', {pageX:event.pageX, firstWidth:firstX}, volumeMouseMove);
	$(document).bind('mouseup', volumeMouseUp);
	$('#volumeBar').unbind('mousedown', volumeBarMouseDown);
}
function volumeMouseMove(event){
	var newWidth = event.data.firstWidth+(event.pageX-event.data.pageX);
	if(newWidth<0)
		newWidth=0;
	if(newWidth>$('#volumeBar').width())
		newWidth=$('#volumeBar').width();
	
	setVolumeBarPosition(newWidth);
}
function volumeMouseUp(event){
	$(document).unbind('selectstart dragstart', rFalse);
	$(document).unbind('mousemove', volumeMouseMove);
	$(document).unbind('mouseup', volumeMouseUp);
	$('#volumeBar').bind('mousedown', volumeBarMouseDown);
}
function setVolumeBarPosition(barX){
	var posW=(1/$('#volumeBar').width())*barX;
	myAudio.volume = posW;
}

/*Audio Functions*/
function setPlaylist(){
	if(Modernizr.audio)
	{
		myAudio = new Audio();
		var audioTagSupport = !(myAudio.canPlayType);
		{
			$(myAudio).bind('timeupdate', function(){
				var rem = parseInt(myAudio.duration - myAudio.currentTime, 10),
				activeWidth = (myAudio.currentTime / myAudio.duration)*$('#playerBar').width(),
				volWidth = (myAudio.volume / 1)*$('#volumeBar').width(),
				Dmins = Math.floor(parseInt(myAudio.duration,10)/60,10),
				Dsecs = parseInt(myAudio.duration,10) - Dmins*60;
				Cmins = Math.floor(parseInt(myAudio.currentTime,10)/60,10),
				Csecs = parseInt(myAudio.currentTime,10) - Cmins*60;
				$('#playerBarActive').css('width', activeWidth+'px');
				$('#volumeBarActive').css('width', volWidth+'px');
				if( !(isNaN(Cmins) || isNaN(Csecs)) )
					$('#playerSongDuration .current').html(Cmins+':'+(Csecs>9?Csecs:'0'+Csecs));
				else
					$('#playerSongDuration .current').html('');
				if( !(isNaN(Dmins) || isNaN(Dsecs)) )
					$('#playerSongDuration .total').html(' / '+Dmins+':'+(Dsecs>9?Dsecs:'0'+Dsecs));
				else
					$('#playerSongDuration .total').html('');
			});
			$('#playerBar').bind('mousedown', playerBarMouseDown);
			$('#volumeBar').bind('mousedown', volumeBarMouseDown);
			
			$('.pauseAudio').click(function(){
				ppauseAudio();
				return false;
			});
			$('.playAudio').click(function(){
				pplayAudio();
				return false;
			});
			$('.stopAudio').click(function(){
				pstopAudio();
				return false;
			});
			$('.nextAudio').click(function(){
				if($('#audioList ul li.active').length==0)
				{
					playAudio($('#audioList ul li:first-child'), 'direct');
				}else{
					if(!$('#audioList li.active').is(':last-child'))
						playAudio($('#audioList ul li.active').next(), 'direct');
					else
						playAudio($('#audioList ul li:first-child'), 'direct');
				}
			});
			
			$('.prevAudio').click(function(){
				if($('#audioList ul li.active').length==0)
				{
					playAudio($('#audioList ul li:last-child'), 'direct');
				}else{
					if(!$('#audioList li.active').is(':first-child'))
						playAudio($('#audioList ul li.active').prev(), 'direct');
					else
						playAudio($('#audioList ul li:last-child'), 'direct');
				}
			});
			$('#playerController .loop').click(function(){
				loop = false;
				$('#playerController .loop').hide();
				$('#playerController .nextsong').show();
			});
			$('#playerController .nextsong').click(function(){
				loop = true;
				$('#playerController .loop').show();
				$('#playerController .nextsong').hide();
			});

			$('.soundiconBG, #playerController .unmute').click(doMute);
			$('.soundmuteBG, #playerController .mute').click(doUnMute);
			
			btnSound = new Audio();
			if(Modernizr.audio.mp3)
				btnSound.src = btnSoundUrlMp3;
			else if(Modernizr.audio.ogg)
				btnSound.src = btnSoundUrlOgg;
			
			if(autoPlay){
				playAudio($('#audioList li:first-child'), 'auto');
			}else{
				$('#playerController .pause').hide();
			}
			if(loop)
				$('#playerController .nextsong').hide();
			else
				$('#playerController .loop').hide();
		}
	}
	$('#audioList ul li').click(function(){
		playAudio(this, 'direct');
	});
}

function ppauseAudio(who){
	if(myAudio.duration>0)
	{
		myAudio.pause();
		$('.pauseAudio').hide();
		$('.playAudio').css('display','inline-block');
	}
}

function pstopAudio(){
	if(myAudio.duration>0)
	{
		myAudio.pause();
		myAudio.currentTime=0;
		$('.playAudio').css('display','inline-block');
		$('.pauseAudio').hide();
	}
}

function pplayAudio(){
	if($('#audioList ul li.active').length==0)
	{
		playAudio($('#audioList ul li:first-child'), 'direct');
	}
	else if(myAudio.duration>0)
	{
		myAudio.play();
		$('.pauseAudio').css('display','inline-block');
		$('.playAudio').hide();
	}
}

function doUnMute(e){
	if(e!=undefined){
		muteAudioChangedBy = e.target.nodeName;
		muteAudioChangedStatus = 'unmute';
	}
	if(myAudio!=undefined)
		myAudio.muted = false;
	if($('#audioList ul li').length>0){
		$('.soundiconBG').css('display', 'block');
		$('.soundmuteBG').hide();
	}
	$('#playerController .mute').hide();
	$('#playerController .unmute').show();
}
function doMute(e){
	if(e!=undefined){
		muteAudioChangedBy = e.target.nodeName;
		muteAudioChangedStatus = 'mute';
	}
	if(myAudio!=undefined)
		myAudio.muted = true;
	if($('#audioList ul li').length>0){
		$('.soundiconBG').hide();
		$('.soundmuteBG').css('display', 'block');
	}
	$('#playerController .mute').show();
	$('#playerController .unmute').hide();
}

// Play Background Audio
function playAudio(obj, type){
	if(Modernizr.audio){
		var isPlaying = !myAudio.paused;
		if(Modernizr.audio.mp3)
			myAudio.src = $(obj).data('mp3');
		else if(Modernizr.audio.ogg)
			myAudio.src = $(obj).data('ogg');
		
		$('#playerSongName').text($(obj).text());

		myAudio.removeEventListener('ended', arguments.callee, false);
		myAudio.addEventListener('ended', audioAddEndedListener , false);
		myAudio.removeEventListener('error', arguments.callee ,true);
		myAudio.addEventListener('error',errorFallback,true);
		
		
		if(autoPlay || isPlaying || type=='direct')
		{
			$(obj).parent().find('li').removeClass('active');
			$(obj).addClass('active');
			if($('#player').is(':hidden')){
				$('#player').css('opacity','0').show();
				$('#player').animate({opacity:1}, 500);
			}
			myAudio.play();
			$('.pauseAudio').css('display','inline-block');
			$('.playAudio').hide();
			$('.stopAudio').css('display','inline-block');
		}else{
			myAudio.play();
			$('.pauseAudio').hide();
			$('.playAudio').css('display','inline-block');
			$('.stopAudio').css('display','inline-block');
		}
	}
}

function errorFallback() {
    //alert('Has got an error while playing this song.');
}

function audioAddEndedListener() 
{
	if(loop){
	this.currentTime = 0;
	this.play();
	}else{
		this.removeEventListener('ended', arguments.callee, false);
		if(!$('#audioList li.active').is(':last-child'))
			$('#audioList li.active').removeClass('active').next().addClass('active');
		else
			$('#audioList li.active').removeClass('active').parent().find('li:first-child').addClass('active');
		playAudio($('#audioList li.active'), 'auto');
		myAudio.addEventListener('ended', audioAddEndedListener, false);
	}
}

// Random string generator
function randomString(size) {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var randomstring = '';
	for (var i=0; i<size; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}

function addionalCharacter(pageLoadingURL){
	if(pageLoadingURL.indexOf('/')>0){
		files = pageLoadingURL.split('/');
		pageName = files[files.length-1];
	}else{
		pageName = pageLoadingURL;
	}
	if(pageName.indexOf('?')>'-1')
		return '&';
	else
		return '?';
}


//Function to convert hex format to a rgb color
var hexDigits = new Array ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
function rgb2hex(rgb){
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
function hex(x){  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];  }

(function($,sr){
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
  // smartresize 
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'sresize');

function getCssProperty(property){
	var vP = "";
	var transitionEnd = "TransitionEnd";
	if ($.browser.webkit) {
		vP = "-webkit-";
		transitionEnd = "webkitTransitionEnd";
	} else if ($.browser.msie || !!navigator.userAgent.match(/Trident\/7\./)) {
		vP = "-ms-";
		transitionEnd = "transitionend";
	} else if ($.browser.mozilla) {
		vP = "-moz-";
		transitionEnd = "transitionend";
	} else if ($.browser.opera) {
		vP = "-o-";
		transitionEnd = "oTransitionEnd";
	}
	if(property=='prefix') return vP;
	else if(property=='transitionend') return transitionEnd;
}
$.fn.cssanimate = function(cssProperties, extra) {
	extra = (typeof extra == 'undefined')?'':extra;
	var duration = (typeof extra.duration == 'undefined')?500:extra.duration;
	var delay = (typeof extra.delay == 'undefined')?0:extra.delay;
	var ease = (typeof extra.ease == 'undefined')?'ease-in-out':extra.ease;
	var removetransion = (typeof extra.removetransion == 'undefined')?true:removetransion;
	
	 var vP = getCssProperty('prefix');
	 var transitionEnd = getCssProperty('transitionend');
	
	return this.each(function() {
		var $this = $(this);
				
		if (Modernizr.csstransitions) {			
		
			for (var k in cssProperties){
				if (cssProperties.hasOwnProperty(k)) {
					 $this.css(k,$this.css(k));
				}
			}
			$this.css(vP+"transition", "none"); 
		
			if(delay>0)
				$this.css(vP+"transition", "all "+duration+"ms "+delay+"ms "+ease);
			else
				$this.css(vP+"transition", "all "+duration+"ms "+ease);
				
			$this.css(cssProperties);
		
			$this.bind(transitionEnd,function(){
				$this.unbind(transitionEnd);
				if(removetransion){
					$this.css(vP+"transition", "none"); 
					$this.css("transition", "none"); 
				}
				if(typeof extra.complete != 'undefined')
					if ($.isFunction(extra.complete))
						extra.complete.call($this);
			});
			
		}else{
			if(typeof extra.complete != 'undefined'){
				if ($.isFunction(extra.complete)) 
					$this.delay(delay).animate(cssProperties, {queue:false, duration:duration, complete:extra.complete});
			}else{
				$this.delay(delay).animate(cssProperties, {queue:false, duration:duration});
			}
		}
	});
};