define("inno/echarts/0.0.2/echarts-debug",["$","echarts3"],function(require,exports,module) {
	var $ = require("$");

	var Echarts =  function(options){
		this.trigger =  $(options.trigger);
		this.setup();
	};

	Echarts.prototype = {
		_echarts:null,
		setup:function(){
			this._echarts =  echarts.init(this.trigger[0]);
		},
		setOption:function(options){
			if(this._echarts == null){
				return;
			}
			this._echarts.setOption(options);
		},
		setTheme:function(options) {
			if(this._echarts == null){
				return;
			}
			this._echarts.setTheme(options);

		}
	};

	module.exports=Echarts;
});