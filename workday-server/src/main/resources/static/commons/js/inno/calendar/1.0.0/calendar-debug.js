define("inno/calendar/1.0.0/calendar-debug",["$","calendar","./calendar-debug.css"],function(require,exports,module){
	var $=require("$"),
		AraleCalendar=require("calendar");


	require("./calendar-debug.css");

	var Calendar=AraleCalendar.extend({
		attrs: {
			disable:false
        },
        setup: function () {
            Calendar.superclass.setup.call(this);
            var disable = this.get("disable"),
            	$el = $(this.get("trigger"));
            if(disable){
            	$el.attr("readonly","readonly");
            }
        }
	});

	module.exports =Calendar;
});