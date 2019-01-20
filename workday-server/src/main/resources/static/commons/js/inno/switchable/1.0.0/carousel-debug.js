define("inno/switchable/1.0.0/carousel-debug",["$","carousel","./const-debug"],function(require, exports, module) {
	var $ = require("$"),
		AraleCarousel = require("carousel"),
        ConstClass = require("./const-debug");

	var Carousel=AraleCarousel.extend({
		    attrs: {
                triggers: {
                    value: [],
                    getter: function(val) {
                        return this.element.find(val);
                    }
                },
                panels: {
                    value: [],
                    getter: function(val) {
                        return this.element.find(val);
                    }
                },
            	classPrefix: "ui-carousel"
        	},
        	setup: function () {
                this._initConstClass();
            	Carousel.superclass.setup.call(this); 
        	},
            _initConstClass: function() {
                var classPrefix = this.get("classPrefix");
                this.CONST = ConstClass(classPrefix);
            }
           
	});

	module.exports = Carousel;
});

define("inno/switchable/1.0.0/const-debug", [], function(require, exports, module) {
    // 内部默认的 className
    module.exports = function(classPrefix) {
        return {
            UI_SWITCHABLE: classPrefix || "",
            NAV_CLASS: classPrefix ? classPrefix + "-nav" : "",
            CONTENT_CLASS: classPrefix ? classPrefix + "-content" : "",
            TRIGGER_CLASS: classPrefix ? classPrefix + "-trigger" : "",
            PANEL_CLASS: classPrefix ? classPrefix + "-panel" : "",
            ACTIVE_CLASS: classPrefix ? classPrefix + "-active" : "",
            PREV_BTN_CLASS: classPrefix ? classPrefix + "-prev-btn" : "",
            NEXT_BTN_CLASS: classPrefix ? classPrefix + "-next-btn" : "",
            DISABLED_BTN_CLASS: classPrefix ? classPrefix + "-disabled-btn" : ""
        };
    };
});