define(function(require, exports, module){
	var Util,
		toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty;

	Util = {
		isNumber:function(val){
			return /^\d+$/.test(val);
		},
		isArray:function(val){
			return toString.call(val) === '[object Array]';
		},
		isObject:function(val){
			return typeof obj === 'object';
		},
		isString:function(val){
			return toString.call(val) === '[object String]';
		},
		isFunction:function(val){
			return toString.call(val) === '[object Function]';
		},
		isNull:function(val){
			return val ? false : true; 
		},
		isWindow:function(o){
			return o != null && o == o.window;
		},
		isEmptyObject:function(o){
			if (!o || toString.call(o) !== "[object Object]" ||
          			o.nodeType || this.isWindow(o) || !o.hasOwnProperty) {
        		return false;
      		}
    
      		for (var p in o) {
        		if (o.hasOwnProperty(p)) return false;
      		}
      		return true;
		},
		isLetters:function(val){
			return /^[A-Za-z0-9]+$/.test(val) ? true : false
		},
		isUpper:function(val){
			return /^[A-Z]+$/.test(val) ? true : false;
		},
		isLower:function(val){
			return /^[a-z]+$/.test(val) ? true : false;
		},
		trim:function(val){
			var reg =  /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
			return (val||"").replace(reg,"");
		},
		evalObj:function(obj){
			if(this.isObject(obj)){
				return obj;
			}else{
				return eval("("+obj+")");
			}
		},
		clone:function(obj){
			if(!(this.isObject(obj)))
				return obj;
			if(obj == null)
				return obj;

			var newObj = new Object();
			for(var i in obj){
				newObj[i] = this.clone(obj[i])
			}
			return newObj;
		},
		merge:function(receiver, supplier){
			var key, value;
    
      		for (key in supplier) {
        		if (supplier.hasOwnProperty(key)) {
          			receiver[key] = cloneValue(supplier[key], receiver[key]);
        		}
      		}
    
      		return receiver;
		},
		getQueryString:function(name){
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    		var r = window.location.search.substr(1).match(reg);
    		if (r != null) return decodeURI(r[2]); return null;
		},
		dateFormat:function(s,format){
			try{
				if(s == "") return "";
				var d = (s instanceof Date) ? s :
						new Date(Date.parse(s.replace(/-/g, "/"))); 
			}catch(err){
				alert("日期格式有误" + err);
        		return;
			}

			if (d == "NaN" || d == "Invalid Date") {
        		return "";
    		}
    		return Format(d, format);
		},
		dateNow:function(format){
			if(!(format)){
				format = "yyyy-MM-dd";
			}
			var d = new Date();

			return Format(d,format);
		},
		plus:function(arg1,arg2){
			var r1,r2,m; 
			r1 = alg(arg1);
			r2 = alg(arg2);
			m=Math.pow(10,Math.max(r1,r2)); 
			return (arg1*m+arg2*m)/m; 
		},
		reduce:function(arg1,arg2){
			var r1,r2,m,n;
		    r1 = alg(arg1);
			r2 = alg(arg2);
		    m=Math.pow(10,Math.max(r1,r2));
		    //last modify by deeka
		    //动态控制精度长度
		    n=(r1>=r2)?r1:r2;
		 //   console.log(n)
		    return ((arg1*m-arg2*m)/m).toFixed(n);
		},
		divide:function(arg1,arg2){
			var t1=0,t2=0,r1,r2; 
			r1 = alg(arg1);
			r2 = alg(arg2);
			with(Math){ 
				r1=Number(arg1.toString().replace(".","")); 
				r2=Number(arg2.toString().replace(".","")); 
				return (r1/r2)*pow(10,t2-t1); 
			} 
		},
		multiply:function(arg1,arg2){
			var m=0,s1=arg1.toString(),s2=arg2.toString(); 
			try{m+=s1.split(".")[1].length}catch(e){}; 
			try{m+=s2.split(".")[1].length}catch(e){}; 
			return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m); 
		},
		moneyFormat:function(val,n){
			n = n > 0 && n <= 20 ? n : 2;
			val = parseFloat((val + "").replace(/[^\d\.-]/g,"")).toFixed(n) + "";
			var l = val.split(".")[0].split("").reverse(),
				r = val.split(".")[1],
				t = "";

			for(i = 0;i < l.length;i++){
				t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");   
			}
			return t.split("").reverse().join("") + "." + r;  
		},
		padLeft: function(str, padStr, len){
			if(str.length >= len){
				return str;
			}else{
				return this.padLeft(padStr + "" + str, padStr, len);
			}
		}
	}

	function alg(val){
		var r1;
		try{
			r1=val.toString().split(".")[1].length
		}catch(e){
			r1=0
		}
		return r1;
	}

	var iteratesOwnLast;
    (function() {
      var props = [];
      function Ctor() { this.x = 1; }
      Ctor.prototype = { 'valueOf': 1, 'y': 1 };
      for (var prop in new Ctor()) { props.push(prop); }
      iteratesOwnLast = props[0] !== 'x';
    }());

	function isPlainObject(o) {
      // Must be an Object.
      // Because of IE, we also have to check the presence of the constructor
      // property. Make sure that DOM nodes and window objects don't
      // pass through, as well
      if (!o || toString.call(o) !== "[object Object]" ||
          o.nodeType || Util.isWindow(o)) {
        return false;
      }
    
      try {
        // Not own constructor property must be Object
        if (o.constructor &&
            !hasOwn.call(o, "constructor") &&
            !hasOwn.call(o.constructor.prototype, "isPrototypeOf")) {
          return false;
        }
      } catch (e) {
        // IE8,9 Will throw exceptions on certain host objects #9897
        return false;
      }
    
      var key;
    
      // Support: IE<9
      // Handle iteration over inherited properties before own properties.
      // http://bugs.jquery.com/ticket/12199
      if (iteratesOwnLast) {
        for (key in o) {
          return hasOwn.call(o, key);
        }
      }
    
      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.
      for (key in o) {}
    
      return key === undefined || hasOwn.call(o, key);
    }

	function cloneValue(value, prev){
      	if (Util.isArray(value)) {
       		value = value.slice();
      	}
      	else if (isPlainObject(value)) {
       		isPlainObject(prev) || (prev = {});
  
       		value = Util.merge(prev, value);
      	}
  
      	return value;
    }

    function Format(d,format){
    	var o = {
         		"M+": d.getMonth() + 1,
         		"d+": d.getDate(),
         		"h+": d.getHours(),
         		"H+": d.getHours(),
         		"m+": d.getMinutes(),
         		"s+": d.getSeconds(),
         		"q+": Math.floor((d.getMonth() + 3) / 3),
         		"w": "0123456".indexOf(d.getDay()),
         		"S": d.getMilliseconds()
        	};
    	
    	if (/(y+)/.test(format)) {
        	format = format.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
    	}
    	for (var k in o) {
        	if (new RegExp("(" + k + ")").test(format))
            	format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    	}
        return format;
    }

	module.exports = Util;
})