define("inno/offline-storage/1.0.0/offline-storage-debug",function(require, exports, module){
	var $ = require("$"),
		BrowserStorage = require("inno/browser-storage/1.0.0/storage-debug"),
		Form = require("inno/form/1.0.0/form-debug"), 
		ConfirmBox = require("inno/dialog/1.0.0/confirmbox-debug"),
		Base = require("base");

	var offlineStorage = Form.extend({
			attrs:{
				element: {
                	value: null,
                	getter: function(val) {
                    	return $(val).eq(0);
                	}
            	},
            	listName:null,
            	autoStatus:false,
            	timer:null
			},
			initialize:function(config){
				offlineStorage.superclass.initialize.call(this,config);
				this.bindEvents();
				this.storage2form();
			},
			bindEvents:function(){
				var $ele = this.get("element"),
					self = this;

				$ele.on("keyup",function(e){
					if(!(self.get("autoStatus"))){
						if(e.keyCode != 13 && e.keyCode != 27){
							self.set("autoStatus",true);

							var timer = setInterval(function(){
								var json =JSON.stringify(self.form2json());
								BrowserStorage.api.set({
									"key":self.get("listName"),
									"value":json,
									"expires":86400
								});
							},3000)

							self.set("timer",timer);
						}
					}
				});
			},
			storage2form:function(){
				var self = this,
					listName = this.get("listName"),
					json =JSON.parse(BrowserStorage.api.get(listName).value);

				if(json){
					new ConfirmBox({
						title:"",
						message:"是否加载上次未填写完的数据",
						onConfirm:function(){
							self.set("json",json);
							self.json2form();
							this.hide();
						}
					}).show()
				}
			},
			clearStorage:function(){
				clearInterval(this.get("timer"));
				BrowserStorage.api.remove(this.get("listName"));
			}
	});

	module.exports =offlineStorage;
});