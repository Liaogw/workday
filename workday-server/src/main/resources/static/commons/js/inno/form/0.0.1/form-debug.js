define("form",["$","base","inno/dialog/1.0.0/confirmbox-debug"],function(require, exports, module){
	var $=require("$"),
		Base=require("base"),
		ConfirmBox = require("inno/dialog/1.0.0/confirmbox-debug");

	var Form=Base.extend({
		attrs:{
			trigger: {
                value: null,
                getter: function(val) {
                    return $(val).eq(0);
                }
            },
			rinput:/^(?:color|date|datetime|input|hidden|month|number|password|range|search|tel|text|time|url|week|checkbox|radio|a)$/i,
			rselectTextarea:/^(?:select|textarea)/i,
			rCRLF:/\r?\n/g,
			eleArray:[],
			data:null,
			addUrl:null,
			setUrl:null,
			json:null,
		},
		initialize: function(config) {
			Form.superclass.initialize.call(this, config);
			this.serializeForm();
		},
		serializeForm:function(){
			var ele =this.get("trigger"),
				rselectTextarea=this.get("rselectTextarea"),
				rinput=this.get("rinput"),		
				array=null;

			array= ele.map(function(){ // 获取该容器中值控件集
				return this.elements ? $.makeArray(this.elements) : this;
			}).filter(function(){
				return this.name && (rselectTextarea.test(this.nodeName) || rinput.test(this.type)); //对值控件集做筛选
			});

			this.set("eleArray",array);
			
		},
		getData:function(){
			var eleArray = this.get("eleArray"),
				rCRLF = this.get("rCRLF"),
				data = null;

			data = eleArray.map(function (i, elem) {
				var val = $(this).val();
				if (elem.type == "checkbox") {
		        	if (this.ucheckvalue) {
		            	val = elem.checked ? val : this.ucheckvalue;
		        	}else {
		            	if ($("input[type=checkbox][name=" + elem.name + "]:checked").length <= 0 && $.inArray(elem.name, eleArray) < 0) {
		                	val = "";
		                	eleArray.push(elem.name);
		            	}else{
		                	val = elem.checked ? val : null;
		            	}
		        	}
		    	}
		    	else if (elem.type == "radio") {
		        	if ($("input[type=radio][name=" + elem.name + "]:checked").length <= 0 && $.inArray(elem.name, eleArray) < 0) {
		            	val = "";
		            	eleArray.push(elem.name);
		        	}else{
		            	val = elem.checked ? val : null;
		        	}
		    	}
		    	this.set('eleArray',eleArray);
		    	return val == null ?
					null :
					$.isArray(val) ?
					$.map(val, function (val, i) {
					    return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
					}) :
					{ name: elem.name, value: val.replace(rCRLF, "\r\n") };
			}).get();
			
			this.set("data",data);
			this.set("json",this.toDataJson(data)); 
		},
		toDataJson:function(data){
			var json="",
				name=null,
				value=null;
   			if( data instanceof Array || data instanceof Object){

      			for(var index in data){
					name="\""+ data[index].name + "\"";
					value= isNaN(data[index].value) ? 
						"\"" + data[index].value + "\"" : 
						(data[index].value ? 
						((data[index].value.charAt(0) =="0" || (data[index].value.length >= 15) )  ? "\"" + data[index].value + "\"" : data[index].value) :null ); //对值先做是否长度超过15位，如果超过15位自动转string 是否string判断 然后判断是否为null “ ”
					if( null==value || "\"\""==value || "\"null\""==value ){
						continue;
					}
					if(json.length==0){
						json += name + ":" + value;
					}else{
						json += "," + name + ":" + value;
					}					
      			}
      			json = "{"+ json +"}";

   			}else{
      			if(!isNaN(parseInt(data))){
         			json+=data;
      			}else{
         			json='"'+data+'"';
      			}
   			}  	
   			return eval("(" + json + ")");
		},
		saveData:function(options){ //表单提交方法 option: type  新增还是编辑，successfn 执行成功callback，errorfn 执行成功callback

			options=$.extend(true,{
				type:1,
				successFn:function(result){
					ConfirmBox.alert('新增成功');
				},
				errorFn:function(result){
					ConfirmBox.alert('新增失败');
				}
			},options);
			type = options.type ? options.type : 1;
			this.getData();
			var json =this.get("json"),
				url= (type==1) ? this.get("addUrl") : this.get("setUrl");
		//	console.log(json);
			$.ajax({
				url: url,
                data: json,
                type:"post",
                success:function(result){
                	options.successFn(result);
					
                },
                error:function(result, err){
                	options.errorFn(result);					
                }
			});
		},
		initGrid:function(){ //grid 绑定数据
		
		},
		initSearch:function(searchGroups){
			var searchGroups =searchGroups,
				eleArray = this.get("eleArray"),
				eleName,
				eleValue,
				ele,
				rulesOP,
				groupName,
				group;

			for(var i=0,j=eleArray.length;i<j;i++){
				eleValue =null;
				ele =$(eleArray[i]);
				eleName= ele.attr("name");
				
				if(ele.is("[type='checkbox']")){
					eleValue =(ele.attr("checked")==true) ? true : false;
				}else{
					eleValue= ele.val();
				}
				
				if(eleValue){
					rulesOP = ele.attr("data-rule-op") || "equal";
					groupName = ele.attr("data-group") || "rules";
					
					if(groupName=="rules"){
						searchGroups["rules"].push({
	                    	field: eleName, op: rulesOP, value: eleValue
	                	});
					}else{
						group= findGroup(searchGroups["groups"],groupName);
						if(!group){
							//alert("查询元素"+eleName+"的定义的group属性值"+group+"未定义!!!!");
							// return ;
						}
						if (!group.rules) group.rules = [];
							group.rules.push({
	                    		field: eleName, op: rulesOP, value: eleValue
	                	});
					}

				}
			}
			
			function findGroup(searchGroups,groupName){
				var array;
				for(var i in searchGroups){
				
					if(searchGroups[i]["groupName"] == groupName){
						array =searchGroups[i];
						return array;
					}
				}
				return array;
			}

			var createTree = (function (){
				function bindTo(all, node){
					var  i =  all.length, id = node.parentName, item;
					for (; i--;) {
						item = all[i];
						if (item.groupName === id) {
							if (!item.groups) {
								item.groups = [];
							}
							item.groups.push(node);
						}
					}
				}
			
				return function (arr){
					var i = 0, j = arr.length, node, tops=[];
					for (var i = 0, j = arr.length, parent; i < j; i++) {
						node = arr[i];
						if (node.parentName) {
							bindTo(arr, node);
						}else{
							tops.push(node);
						}
					}
				return tops;
			}	
			})();

			var tree =createTree(searchGroups["groups"]);
			searchGroups["groups"]=tree;
			
			return this.toJSON(searchGroups); 
		},
		toJSON : function(o) {
			var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
			var quote = function (value){
				escapable.lastIndex = 0;
				return escapable.test(value) ?
						'"' + value.replace(escapable, function (a){
							var c = meta[a];
							return typeof c === 'string' ? c :
								'\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
						}) + '"' :
							'"' + value + '"';
			};
			if (o === null) return 'null';
			var type = typeof o;
			if (type === 'undefined') return undefined;
			if (type === 'string') return quote(o);
			if (type === 'number' || type === 'boolean') return '' + o;
			if (type === 'object'){
				var pairs = [];
				if (o.constructor === Array){
					for (var i = 0, l = o.length; i < l; i++){
						pairs.push(this.toJSON(o[i]) || 'null');
					}
					return '[' + pairs.join(',') + ']';
				}
				var name, val;
				for (var k in o){
					type = typeof k;
					if (type === 'number'){
						name = '"' + k + '"';
					} else if (type === 'string'){
						name = quote(k);
					} else{
						continue;
					}
					type = typeof o[k];
					if (type === 'function' || type === 'undefined'){
						continue;
					}
					val = this.toJSON(o[k]);
					pairs.push(name + ':' + val);
				}
				return '{' + pairs.join(',') + '}';
			}
		}
		

	});



	module.exports =Form;

})