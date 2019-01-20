define("inno/calendar/1.1.2/calendar-debug",["$","arale/calendar/1.1.2/calendar-debug","./calendar-debug.css"],function(require,exports,module){
	var $=require("$"),
		AraleCalendar=require("arale/calendar/1.1.2/calendar-debug");


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