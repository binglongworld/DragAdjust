$(function(){
	$('.freepanel-widget').on('mouseenter', function(){
		$(this).addClass('drag-box');
		Drag.config.drag_box = this;
	});
});