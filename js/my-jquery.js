$(document).ready(function(){

 //    var HOSTNAME = window.location.origin.indexOf('localhost') ? "http://localhost:8000/" : "mfly://"
	// mflyCommands.setPrefix(HOSTNAME);

	document.addEventListener('touchmove', function(event) {
    	event.preventDefault();
    }, false);

	var scrolling = false;

	// Uses body because jquery on events are called off of the element they are
	// added to, so bubbling would not work if we used document instead.
	$('body').on('touchstart','.panel-body',function(e) {

	    // Only execute the below code once at a time
	    if (!scrolling) {
	        scrolling = true;   
	        if (e.currentTarget.scrollTop === 0) {
           		e.currentTarget.scrollTop = 1
           	} else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
	            e.currentTarget.scrollTop -= 1;
	        }
	            scrolling = false;
	        }
	    });

	// Prevents preventDefault from being called on document if it sees a scrollable div
	$('body').on('touchmove','.panel-body',function(e) {
	    e.stopPropagation();
	});


    $(function() {
    	FastClick.attach(document.body);
	});

    
    // Hamburger Menu
	$("#menu").mmenu();


	$('.annotations').bind("touchstart click" , function(){
		$('#menu').trigger("close.mm");
		mflyCommands.showAnnotations(500,500,500,500);
	})

	$('.second-screen').bind("touchstart click" , function(){
		$('#menu').trigger("close.mm");
		mflyCommands.showSecondScreen();
	})

	$('.collections').bind("touchstart click" , function(){
		$('#menu').trigger("close.mm");
		mflyCommands.showAddToCollection("f7e484d0e3ee4e87901ee34fe2fcbe1aproduct165484", 1, 1, 1, 1);
	})

	$('.email').bind("touchstart click" , function(){
		$('#menu').trigger("close.mm");
		mflyCommands.email("f7e484d0e3ee4e87901ee34fe2fcbe1aproduct165484");
	})

	// Ticketed to add API call for comments and notes

	// $('.comments').bind("touchstart click" , function(){
	// 	$('#menu').trigger("close.mm");
	// })

	// $('.notes').bind("touchstart click" , function(){
	// 	$('#menu').trigger("close.mm");
	// })

	$('.previous').bind("touchstart click", function(){
		mflyCommands.previous();
	})

	$('.next').bind("touchstart click", function(){
		mflyCommands.next();
	})

	$('.refresh').bind("touchstart click" , function(){
		$('#menu').trigger("close.mm");
		mflyCommands.refresh();
	})
	

	$('.close-btn').bind("touchstart click" , function(){
		$('#menu').trigger("close.mm");
		mflyCommands.close();
	})		


});