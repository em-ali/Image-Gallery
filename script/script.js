/*
 * ---------------------------------------- *
 * Name: script.js               			*
 * Type: JavaScript                         *
 * Version: 1.0.0                           *
 * Author: Mehmud		                    *
 * Status: Development                      *
 * ---------------------------------------- *
 */

 $(document).ready(function (){
 	$('.img-gallery').imageGallery({
        slide: true,
        animationSpeed: 500,
        slideDirection: "bottomToTop"
    });
 });