define("inno/dnd/0.0.1/dnd-debug",["$","base", "class", "events" ],function(require,exports,module){
	var Dnd = null;
    var $ = require("$"), 
    	Base = require("base");

    Dnd = Base.extend({
        attrs: {
            element: {
                value: null,
                readOnly: true
            },
            containment: null,
            axis: false,
            visible: false,
            proxy: null,
            drop: null,
            revert: false,
            revertDuration: 500,
            disabled: false,
            dragCursor: "move",
            dropCursor: "copy",
            zIndex: 9999
        }
    });
})