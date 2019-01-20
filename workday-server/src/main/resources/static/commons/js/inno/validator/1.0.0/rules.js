define(function(require) {
	var Validator = require('validator'),
		$ = require('$');

	Validator.addRule('english',/^[\x00-\x7F]*$/);
	Validator.addRule('chinese',/[\u4e00-\u9fa5]/);
	Validator.addRule('singleChar',/^[\x00-\x7F]*$/);
	Validator.addRule('onlyChinese',/^[\u4e00-\u9fa5]*$/);
	Validator.addRule('notChinese',/^[^\u4e00-\u9fa5]*$/);
	Validator.addRule('uInteger',/^\d+$/);
	Validator.addRule('pInteger',/^[1-9]\d*$/);
	Validator.addRule('integerOrAlphabet',/^[0-9a-zA-Z]+$/);
	Validator.addRule('alphabet',/^[a-zA-Z]+$/);
	Validator.addRule('mobile',/^1\d{10}$/);
	Validator.addRule('idCard',/(^\d{15}$)|(^\d{17}([0-9]|X)$)/);
	Validator.addRule('ip',/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/);

	Validator.addRule('equLength', function (options) {
    	var element = options.element;
    	var l = element.val().length;
    	return l === Number(options.length);
	});
	Validator.addRule('hsCode', function (options) {
    	var value = options.element.val(),
        	flag = false;
    	if (/^\d{8}$/.test(value) || /^\d{10}$/.test(value) || /^\d{8}\.\d{2}$/.test(value)) {
        	flag = true;
    	}
    	return flag;
	});
	Validator.addRule('precision', function (options) {
    	var element = options.element,
        	point = parseInt(options.point, 10);
    	var regex = new RegExp("^(\\d+(\\.[\\d]{1," + point + "})?)?$", 'g');
    	return !!regex.test(element.val());
	});
	Validator.addRule('less', function (options) {
    	var element = options.element,
        	max = options.max;
    	return Number(element.val()) < Number(max);
	});
	Validator.addRule('great', function (options) {
    	var element = options.element,
        	min = options.min;
    	return Number(element.val()) > Number(min);
	});
	Validator.addRule('number', function (options) {
    	var $el = options.element,
        	val = $el.val();
    	return !isNaN(val);
	});
	Validator.addRule('trim', function (options) {
    	var $el = options.element,
        	newVal = $.trim($el.val());
    	$el.val(newVal);
    	return true;
	});
});