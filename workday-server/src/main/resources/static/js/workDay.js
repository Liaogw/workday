$(document).ready(function() {
//	var layer;
	layer.config({
	    extend: './layer.ext.js'
	});

	var curWwwPath=window.document.location.href;
	var pathName=window.document.location.pathname;
	var pos=curWwwPath.indexOf(pathName);
	var localhostPaht=curWwwPath.substring(0,pos);

	$('#calendar').fullCalendar({
	
		editable: true,
		
		events:function(start,end,callback) {
	        $.ajax({
	            url:"../api/notWorkDay",
	            methon:"GET",
	            data: {
	                start:getDate(start),
	                end: getDate(end)
	            },
	            success:function(doc) {
	                var events = [];
	                for (var i = 0; i < doc.length; i++) {
	                    var ev = doc[i];
	                    var title = ev.title;
	                    var evtstart = new Date(Date.parse(ev.start));
	                    events.push({
	                        title:title,
	                        start:evtstart,
	                        editable:false
	                    });
	                }
	                callback(events);
	            },
	            error:function(e) {
	                console.info(e);
	            }
	        })
	    },
		
		dayClick: function(date, allDay, jsEvent, view) {
//			$(this).css('background-color', 'red');
//			var events = $('#calendar').fullCalendar('refetchEvents');
			var day = getDate(date);
			layer.open({
				  type: 2,
				  title: '工作日编辑',
				  area: ['300px', '150px'],
				  content: localhostPaht+'/workday/api/edit?date='+day //iframe的url
				}); 
		}
	});
	
	function getDate(time){
		var year = time.getFullYear();
		var month = time.getMonth()+1;
		if(month<10){
			month = "0"+month
		}
		var day = time.getDate();
		if(day<10){
			day = "0"+day;
		}
		return year+"-"+month+"-"+day;
	}
	
});