/*
 * ---------------------------------------- *
 * Name: Image Gallery                      *
 * Type: JavaScript                         *
 * Version: 1.0.0                           *
 * Author: Mehmud Ali                       *
 * Status: Development                      *
 * Requisites: >=jquery-1.11.0.min.js       *
 * ---------------------------------------- *
 */

/* additions in revision
 *
 * FEATURE: Slide with settings     DONE
 * FEATURE: Fade with settings      DONE
 * FEATURE: as jQuery plugin        DONE
 * FEATURE: Transition types        PARTIAL
 * FEATURE: lightbox integration    TODO
 * FEATURE: Image preloading        TODO
 * FEATURE: multimedia support      TODO
 * FEATURE: Vertical thumbs slider  TODO
 * BUG:     Exception handling for user input for animation type, and slide direction   TODO
 * BUG:     First load doesn't prohibit active slide from animating                     TODO
 *
 */

; (function($){
    $.fn.imageGallery = function(options){ // extending jquery fn

        // valid animation algorithms
        var ANIM_TYPE = ["easeInSine", "easeOutSine", "easeInOutSine", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic", "easeInQuart", "easeOutQuart", "easeInOutQuart", "easeInQuint", "easeOutQuint", "easeInOutQuint", "easeInExpo", "easeOutExpo", "easeInOutExpo", "easeInCirc", "easeOutCirc", "easeInOutCirc", "easeInBack", "easeOutBack", "easeInOutBack", "easeInElastic", "easeOutElastic", "easeInOutElastic", "easeInBounce", "easeOutBounce", "easeInOutBounce"];

        var defaults = {
            fade: false,
            animationSpeed : 400,
            slide: false,
            slideDirection: "rightToLeft",
            zoomLightbox: false
        };

        options.animationType = ANIM_TYPE.indexOf(options.animationType) == -1 ? ANIM_TYPE[0] : options.animationType; // check animation type is valid


        return this.each(function(){ // return this for jquery chaining

            var config = $.extend({}, defaults, options); // options override defaults

            var $thumbnails,                                                // thumbnail items
                $thumbnailImg,                                              // thumbnail item image
                imgWidth,                                                   // image width
                imgHeight,                                                  // image height
                src,                                                        // image src path
                alt,                                                        // image alternative text
                $imgGallery = $(this),                                      // gallery element
                $imgContainer = $imgGallery.find('.img-container'),         // main focul image container
                $focusImg = $imgContainer.find('img'),                      // main image
                $topImg = $imgContainer.find('.top-img'),                   // top level image
                $btmImg = $imgContainer.find('.btm-img'),                   // bottom level image
                $activeImg,													// current active image
                $targetImg,                                                 // target slide image for slide
                $previousActiveImg;                                          // previously active feature image

            var gallery = {
                init: function () {
                    gallery.setup();
                    gallery.imgUpdt($thumbnails.first());
                    gallery.events();
                },
                setup: function() {
                    $thumbnails = $imgGallery.find('.thumb-item');

                    if (gallery.factory.lightboxTest()) {
                        $('body').prepend('<span class="overlay"></strong>');
                    }
                },
                events: function() {
                    $thumbnails.click(function() {
                        if (!$imgContainer.children().is(':animated')) { // check if not animating
                            if (!$(this).hasClass('active')) { // check if selected thumb is already selected.
                                gallery.imgUpdt($(this));
                            }
                        }
                    });

                    $focusImg.click(function() {
                        if ($('overlay:hidden')) { // check if modal window visible
                            gallery.lightbox($lightboxTrigger);
                        }
                    });
                },
                imgUpdt: function($thumbnailTrigger) { // select thumnail item image
                    $thumbnailImg = $thumbnailTrigger.children('img'); // clicked thumbnail image element
                    gallery.attrUpdt($thumbnailTrigger);
                },
                fade: function($thumbnailTrigger) {
                    if ($topImg.hasClass('active')) { // if top img has active class
                        gallery.btmImgUpdt($thumbnailTrigger); // update bottom image with attributes
                        $topImg.fadeOut(config.animationSpeed, function() { // fade top opacity to 0
                            gallery.setActive($thumbnailTrigger); // set active classes
                        });
                    } else {
                        gallery.topImgUpdt(); // update top img with attributes
                        $topImg.fadeIn(config.animationSpeed, function() { // fadein top opacity to 100
                            gallery.setActive($thumbnailTrigger); // set active classes
                        });
                    }
                },
                slide: function($thumbnailTrigger) {
                    $activeImg = $imgContainer.find('img.active');
                    gallery.setTargetImg();

                    var cssProps, animProp;
                    switch (config.slideDirection) {
                    case "leftToRight":
                        cssProps = { 'left': imgWidth, 'z-index': '1' };
                        animProp = { 'left': '-=' + imgWidth };
                        break;
                    case "rightToLeft":
                        cssProps = { 'right': imgWidth, 'z-index': '1' };
                        animProp = { 'right': '-=' + imgWidth };
                        break;
                    case "bottomToTop":
                        cssProps = { 'top': imgHeight, 'z-index': '1' };
                        animProp = { 'top': '-=' + imgHeight };
                        break;
                    case "topToBottom":
                        cssProps = { 'top': '-=' + imgHeight, 'z-index': '1' };
                        animProp = { 'top': imgHeight - imgHeight };
                        break;
                    }

                    gallery.makeSlide(cssProps, animProp, $thumbnailTrigger);
                },
                makeSlide: function(cssProp, animProp, $thumbnailTrigger) {
                    $targetImg.css(cssProp);

                    gallery.setActiveAttr();

                    $previousActiveImg.css('z-index', 0);

                    $targetImg.animate(animProp, config.animationSpeed, config.animationType, function() {
                        gallery.setActive($thumbnailTrigger); // set active classes
                    });
                },
                slideActions: {
                    common: function(cssProp, animProp, $thumbnailTrigger) {
                        $targetImg.css(cssProp);

                        gallery.setActiveAttr();

                        $previousActiveImg.css('z-index', 0);

                        $targetImg.animate(animProp, config.animationSpeed, config.animationType, function() {
                            gallery.setActive($thumbnailTrigger); // set active classes
                        });
                    }
                },
                topImgUpdt: function() { // top image attribute update
                    $topImg.attr({
                        'src': src,
                        'alt': alt
                    });
                },
                btmImgUpdt: function() { // bottom image attribute update
                    $btmImg.attr({
                        'src': src,
                        'alt': alt
                    });
                },
                setActiveAttr: function() {
                    if ($topImg.hasClass('active')) {
                        gallery.btmImgUpdt(); // update bottom image with attributes
                    } else {
                        gallery.topImgUpdt(); // update top image with attributes
                    }
                },
                setTargetImg: function() {
                    if ($topImg.hasClass('active')) {
                        $targetImg = $btmImg;
                        $previousActiveImg = $topImg;
                    } else {
                        $targetImg = $topImg;
                        $previousActiveImg = $btmImg;
                    }
                    //console.log($targetImg);
                },
                attrUpdt: function($thumbnailTrigger) { // get image attributes
                    src = $thumbnailImg.attr('src');
                    alt = $thumbnailImg.attr('alt');
                    imgWidth = $topImg.width();
                    imgHeight = $topImg.height();

                    // test for what transistion type is set
                    switch (gallery.factory.transitionType()) {
                        case 'fade':
                            (gallery.factory.ActiveImgTest()) ? gallery.fade($thumbnailTrigger) : gallery.dfltattrUpdt($thumbnailTrigger);
                            break;
                        case 'slide':
                            (gallery.factory.ActiveImgTest()) ? gallery.slide($thumbnailTrigger) : gallery.dfltattrUpdt($thumbnailTrigger);
                            break;
                        default:
                            gallery.dfltattrUpdt($thumbnailTrigger);
                    }
                },
                dfltattrUpdt: function($thumbnailTrigger) { // default case for image update
                    gallery.topImgUpdt(src, alt);
                    gallery.setActive($thumbnailImg, $thumbnailTrigger);

                },
                setActive: function($thumbnailTrigger) {
                    $thumbnails.removeClass('active');
                    $thumbnailTrigger.addClass('active');

                    if (!$topImg.hasClass('active') && !$btmImg.hasClass('active')) { // test inital load if active is set
                        $topImg.addClass('active');
                        return false;
                    }

                    if (config.fade || config.slide) {
                        if ($topImg.hasClass('active')) {
                            $topImg.removeClass('active');
                            $btmImg.addClass('active');
                        } else {
                            $btmImg.removeClass('active');
                            $topImg.addClass('active');
                        }
                    }
                },
                lightbox: function($lightboxTrigger) {
                    gallery.attrUpdt($lightboxTrigger);
                    $(".overlay").prepend('<img src="' + src + '" alt="' + alt + '"/>');
                },
                // factory methods
                factory: {
                    transitionType: function() { // transition type test
                        return (config.fade) ? "fade" : (config.slide) ? "slide" : "default";
                    },
                    ActiveImgTest: function() { // check
                        return ($imgContainer.children().hasClass('active'));
                    },
                    lightboxTest: function() { // check
                        return (config.zoomLightbox);
                    },
                    errorHandling: function() {

                    }
                }
            };
            gallery.init();
        });
    };
}(jQuery));



