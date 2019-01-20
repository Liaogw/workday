define("arale/position/1.0.1/position",["$"],function(e,t){function n(e){e=f(e)||{},e.nodeType&&(e={element:e});var t=f(e.element)||u;if(1!==t.nodeType)throw Error("posObject.element is invalid.");var n={element:t,x:e.x||0,y:e.y||0},o=t===u||"VIEWPORT"===t._id;return n.offset=function(){return p?{left:0,top:0}:o?{left:d(document).scrollLeft(),top:d(document).scrollTop()}:l(d(t)[0])},n.size=function(){var e=o?d(window):d(t);return{width:e.outerWidth(),height:e.outerHeight()}},n}function o(e){e.x=i(e.x,e,"width"),e.y=i(e.y,e,"height")}function i(e,t,n){if(e+="",e=e.replace(/px/gi,""),/\D/.test(e)&&(e=e.replace(/(?:top|left)/gi,"0%").replace(/center/gi,"50%").replace(/(?:bottom|right)/gi,"100%")),-1!==e.indexOf("%")&&(e=e.replace(/(\d+(?:\.\d+)?)%/gi,function(e,o){return t.size()[n]*(o/100)})),/[+\-*\/]/.test(e))try{e=Function("return "+e)()}catch(o){throw Error("Invalid position value: "+e)}return c(e)}function r(e){var t=e.offsetParent();t[0]===document.documentElement&&(t=d(document.body)),m&&t.css("zoom",1);var n;return n=t[0]===document.body&&"static"===t.css("position")?{top:0,left:0}:l(t[0]),n.top+=c(t.css("border-top-width")),n.left+=c(t.css("border-left-width")),n}function c(e){return parseFloat(e,10)||0}function f(e){return d(e)[0]}function l(e){var t=e.getBoundingClientRect(),n=document.documentElement;return{left:t.left+(window.pageXOffset||n.scrollLeft)-(n.clientLeft||document.body.clientLeft||0),top:t.top+(window.pageYOffset||n.scrollTop)-(n.clientTop||document.body.clientTop||0)}}var s=t,u={_id:"VIEWPORT",nodeType:1},d=e("$"),p=!1,a=(window.navigator.userAgent||"").toLowerCase(),m=-1!==a.indexOf("msie 6");s.pin=function(e,t){e=n(e),t=n(t);var i=d(e.element);"fixed"!==i.css("position")||m?(i.css("position","absolute"),p=!1):p=!0,o(e),o(t);var c=r(i),f=t.offset(),l=f.top+t.y-e.y-c.top,s=f.left+t.x-e.x-c.left;i.css({left:s,top:l})},s.center=function(e,t){s.pin({element:e,x:"50%",y:"50%"},{element:t,x:"50%",y:"50%"})},s.VIEWPORT=u});