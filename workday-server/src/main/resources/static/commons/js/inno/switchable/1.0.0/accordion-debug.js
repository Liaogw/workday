define("inno/switchable/1.0.0/accordion-debug",["$","accordion"],function(require, exports, module) {
	var $ = require("$"),
		AraleAccordion = require("accordion");

	var Accordion=AraleAccordion.extend({
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
            	classPrefix: "ui-accordion"
        	},
        	setup: function () {
            	Accordion.superclass.setup.call(this); 
        	}
           
	});

	module.exports = Accordion;
})