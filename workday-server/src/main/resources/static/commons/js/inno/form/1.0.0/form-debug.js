define("inno/form/1.0.0/form-debug",function(require, exports, module) {
	var $ = require("$"),
		Base=require("base");

	var Form = Base.extend({
			attrs:{
				element: {
                	value: null,
                	getter: function(val) {
                    	return $(val).eq(0);
                	}
            	},
            	json:null
			},
			initialize:function(config){
				Form.superclass.initialize.call(this,config);
			},
            clearForm:function(){
                var element = this.get("element"),
                form = element.find('input[name], textarea[name], select[name]'),
                formJSON = {};

                for(var i = 0; i < form.length; i++){
                    var ele = form[i],
                        eleVal = ele.value,
                        match = ele.name.match(/([^\[\]]+)/g);

                    if(form[i].tagName === 'INPUT') {
                        switch(form[i].type) {
                            case 'radio' :
                            
                                break;
                            case 'checkbox' :
                                form[i].checked = false;
                                break;
                        }
                    }
                    setVal(formJSON, match, "");
                    form[i].value = "";
                }

                this.set("json",formJSON);
            },
			form2json:function(){
				var element = this.get("element"),
                form = element.find('input[name], textarea[name], select[name]'),
                formJSON = {};

            	for(var i = 0; i < form.length; i++){
                	var ele = form[i],
                    	eleVal = ele.value,
                    	match = ele.name.match(/([^\[\]]+)/g);

                	if(form[i].tagName === 'INPUT') {
                    	switch(form[i].type) {
                        	case 'radio' :
                           		eleVal = getRadioData(element, form[i].name);
                            	break;
                        	case 'checkbox' :
                            	eleVal = getCheckboxData(element, form[i].name);
                            	break;
                    	}
                	}
                	setVal(formJSON, match, eleVal);
            	}

            	this.set("json",formJSON);
            	return formJSON;
			},
			json2form:function(){
            	var element = this.get("element"),
                	form = element.find('input[name], textarea[name], select[name]'),
                	formData = {},
                	json = this.get("json");

            	//将 json 格式翻译成对应的 key value
            	getVal(json);

                function getVal(json, parent) {
                    parent = parent || '';
                    for(var i in json){
                        if(typeof json[i] === 'object'){
                            if(parent.length > 0) {
                                getVal(json[i], parent + '[' + i + ']');
                            }
                            else{
                                getVal(json[i], i);
                            }
                        }
                        else{
                            if(parent){
                                formData[parent + '[' + i + ']'] = json[i];
                            }
                            else{
                                formData[i] = json[i];
                            }
                        }
                    }
                }
            	//执行一次 form 查找把值塞进去
            	for(i = 0; i<form.length; i++){
                	if(form[i].tagName === 'INPUT' && form[i].type === 'radio') {
                    	setRadioData(element, form[i].name, formData[form[i].name]);
                	}
                	else if(form[i].tagName === 'INPUT' && form[i].type === 'checkbox') {
                    	setCheckboxData(element, form[i].name, formData[form[i].name]);
                	}
                	else{
                    	element.find('[name="' + form[i].name + '"]').val(formData[form[i].name]);
                	}
            	}
			}
	});

	function setVal(obj, key, value) {
        var k = key[0];

        if(key.length > 1 && /^\d+$/.test(key[1])){
            obj[k] = obj[k] || [];
        }
        else{
            obj[k] = obj[k] || {};
        }

        if(1 === key.length) {
            obj[k] = value;
        }
        else {
            key.shift();
            setVal(obj[k], key, value);
        }
        return obj;
    }

    function getRadioData(element, elName) {
        return element.find('[name="' + elName + '"]:checked').val();
    }

    function setRadioData(element, elName, value){
        element.find('[name="' + elName + '"]').each(function(){
            this.checked = (this.value === value);
        });
    }

    function getCheckboxData(element, elName) {
        var $checkedEls = element.find('[name="' + elName + '"]:checked'),
            value = [];
        $checkedEls.each(function() {
            value.push($(this).val());
        });
        return value.join(',');
    }

    function setCheckboxData(element, elName, value){
        var $checkedEls = element.find('[name="' + elName + '"]'),
            valueItems = value.split(',');

        $checkedEls.each(function() {
            this.checked = (valueItems.indexOf(this.value) !== -1);
        });
    }

	module.exports =Form;
});