$(document).ready(function() {
	var url=window.document.location.href;
	var date= url.substr(url.lastIndexOf('?date=')+6)
	$('#date').text(date);
	
	$.ajax({
        url:"../api/getISWorkDay?time="+date,
        methon:"GET",
        success:function(result) {
        	$("#isWorkDay ").val(result);
        },
        error:function(e) {
            console.info(e);
        }
    })
    
    $('#dayEdit').click(function(){
    	var isWorkDay = $("#isWorkDay ").val();
    	$.ajax({
            url:"../api/saveWorkDay?time="+date+"&isWorkDay="+isWorkDay,
            methon:"GET",
            success:function(result) {
//            	parent.location.reload();
            	parent.$('#calendar').fullCalendar('refetchEvents')
            	var index = parent.layer.getFrameIndex(window.name);
            	parent.layer.close(index);
            },
            error:function(e) {
                console.info(e);
            }
        })
    });
});