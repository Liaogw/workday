define("menu",["$", "widget", "base", "class", "events","easing","./menu-debug.css"],function(require, exports, module){
	var $=require("$");
	var Widget = require("widget");

    require("./menu-debug.css");
	var Menu=Widget.extend({
        attrs: {
            
             // 可以是 Selector、jQuery 对象、或 DOM 元素集
            triggers: {
                value: '.menu',
                getter: function(val) {
                    return $(val);
                }
            },
            trigger:{
                value: '.nav-item',
                getter: function(val) {
                    return $(val);
                }
            },
            trigger2:{
                value: '.main-sub-nav-item',
                getter: function(val) {
                    return $(val);
                }
            },
            panels: {
                value: '.main-sub-nav-list',
                getter: function(val) {
                    return $(val);
                }
            },
            // 触发事件委托的对象
            delegateNode: {
                value: null,
                getter: function(val) {
                    return $(val);
                }
            },
            // 是否包含 triggers，用于没有传入 triggers 时，是否自动生成的判断标准
            hasTriggers: true,
            // 触发类型
            triggerType: "hover",
            // or 'click'
            // 触发延迟
            delay: 100,
            // 初始切换到哪个面板
            activeIndex: {
                value: 0
            },
            menuSize:0,
            subMenuSize:0,
            homePage:"../portal/portal.html",
            goBack:""
        },
        events: {
            "click .main-sub-nav-right .prev":"_prev",
            "click .main-sub-nav-right .next":"_next",
            "click .main-sub-nav2 .prev":"_subPrev",
            "click .main-sub-nav2 .next":"_subNext"
        },
        _onRenderMenuSize:function(val){
            this.get("panels").css("width",(val * 104 ) + "px");
        },
        _onRenderSubMenuSize:function(val){
            this.get("triggers").find(".main-sub-nav2-list").css("width",(val * 104 ) + "px");
        },
        setup:function(){ //装载menu方法，new出menu属性后  自动调用
            this._initHtml(this.get("model"));
            this._bindHover();
           
        },
        _initHtml:function(data){
            var strhtml="",
                menuSize=0,
                url,
                homePage=this.get("homePage"),
                goBack=this.get("goBack");
            strhtml += "<div class=\"main-sub-nav-bg\">";
            strhtml += "    <div class=\"main-sub-nav\">";
            strhtml += "        <div class=\"main-sub-nav-left\">";
            strhtml += "            <a class=\"btn goBack\" href=\""+ goBack +"\" ><i class=\"return\"></i><span>返回上级</span></a>";
            strhtml += "            <a class=\"btn homePage\" href=\""+ homePage +"\" ><i class=\"home\"></i><span>返回首页</span></a>";
            strhtml += "        </div>";
            strhtml += "        <div class=\"main-sub-nav-right\">";
            strhtml += "            <i class=\"prev\"></i>";
            strhtml += "            <i class=\"next\"></i>";
            strhtml += "            <div class=\"main-sub-nav-content\">";
            strhtml += "                <ul class=\"main-sub-nav-list\">";

            for(var intCount in data){
                url="";
                if(data[intCount].url !="undefined" && data[intCount].url != null && data[intCount].url != ""){
                    url="href=\""+ data[intCount].url +" \" target=\"_blank\"";
                }
                strhtml += "<li class=\"main-sub-nav-item\" data-rows=\""+ intCount +"\">";
                strhtml += "    <a "+url+"><span>" + data[intCount].name + "</span></a>";
                strhtml += "</li>";
                menuSize++;
            }
            
            strhtml += "                </ul>";
            strhtml += "            </div>";
            strhtml += "        </div>";
            strhtml += "    </div>";
            strhtml += "</div>";
            strhtml += "<div class=\"main-sub-nav2-bg\">";
            strhtml += "    <div class=\"main-sub-nav2\">";
            strhtml += "        <i class=\"prev\"></i>";
            strhtml += "        <i class=\"next\"></i>";
            strhtml += "        <div class=\"main-sub-nav2-content\">";
            strhtml += "            <ul class=\"main-sub-nav2-list\">";
            strhtml += "            </ul>";
            strhtml += "        </div>";
            strhtml += "    </div>";
            strhtml += "</div>";

            this.element.html(strhtml);
            if(menuSize<=7){
                $(".main-sub-nav-right .prev").hide();
                $(".main-sub-nav-right .next").hide();   
            }else{
                $(".main-sub-nav-right .prev").show();
                $(".main-sub-nav-right .next").show();
            }
            this.set("menuSize",menuSize);
            if(goBack=="undefined" || goBack=="" || goBack ==null){
                $(".goBack").css("display","none");
            }
        },
        _showSub:function(rows){
            var data = this.get("model")[rows].child,
                strhtml="",url,
                intCount=0,
                triggers=this.get("triggers");


            for (var i in data) {
                url="";
                if(data[i].url !="undefined" && data[i].url != null && data[i].url != ""){
                    url="href=\""+ data[i].url +" \" target=\"_blank\"";
                }
                strhtml +="<li class=\"main-sub-nav2-item\">";
                strhtml +=" <a "+ url +"><span>"+ data[i].name +"</span></a>";
                strhtml +="</li>";
                intCount++;
            };
           if (intCount<=9) {
                $(".main-sub-nav2 .prev").hide();
                $(".main-sub-nav2 .next").hide();   
            }else{
                $(".main-sub-nav2 .prev").show();
                $(".main-sub-nav2 .next").show();
            };
            this.set("subMenuSize",intCount);
            triggers.find(".main-sub-nav2-list").html(strhtml);
        },
        _bindHover: function() {
            var trigger = this.get("trigger");
            var trigger2 = this.get("trigger2");
            var delegateNode = this.get("delegateNode");
            var delay = this.get("delay");
            var showTimer, hideTimer;
            var that = this;

            bindEvent("mouseenter", trigger, function() {
                clearTimeout(hideTimer);
                hideTimer = null;
                // 标识当前点击的元素
                $(this).addClass("current");
                that.activeTrigger = $(this);
                showTimer = setTimeout(function() {
                    that.element.show();
                }, delay);
            }, delegateNode, this);
            bindEvent("mouseleave", trigger, leaveHandler, delegateNode, this);

            bindEvent("mouseenter", trigger2, function() {
                clearTimeout(hideTimer);
                hideTimer = null;
                var row=$(this).attr("data-rows");
                // 标识当前点击的元素
                $(".nav-item").addClass("current");
                $(".main-sub-nav-item").removeClass("current");
                $(".main-sub-nav-item[data-rows="+ row +"]").addClass("current");
                that._showSub(row);
                that.activeTrigger = $(this);
                showTimer = setTimeout(function() {
                    that.element.find(".main-sub-nav2-bg").show();
                }, delay);
             
                var data=that.attrs.model.value[row].child;
                if(data =="undefined" || data == null || data == ""){
                    showTimer=setTimeout(function() {
                        that.element.find(".main-sub-nav2-bg").hide();
                    }, delay);
                    
                }
            }, delegateNode, this);
            bindEvent("mouseleave", trigger2, leaveHandler2, delegateNode, this);
            // 鼠标在悬浮层上时不消失
         
            this.delegateEvents("mouseenter", function() {
               
                clearTimeout(hideTimer);
            });
            this.element.find(".main-sub-nav2-bg").mouseenter(function(){
                clearTimeout(hideTimer);
            });
            this.delegateEvents("mouseleave", leaveHandler);
            this.delegateEvents("mouseleave", leaveHandler2);
            function leaveHandler(e) {
                clearTimeout(showTimer);
                showTimer = null;
                $(".nav-item").removeClass("current");
                 $(".main-sub-nav-item").removeClass("current");
                hideTimer = setTimeout(function() {
                    that.element.hide();
                }, delay);
                
            }

            function leaveHandler2(e){
                clearTimeout(showTimer);
                showTimer =null;
               
                hideTimer =setTimeout(function(){
                    that.element.find(".main-sub-nav2-bg").hide();
                },delay)
            }
        },
        _next:function(){
            var obj=this.get("triggers").find(".main-sub-nav-list"),
            left=parseInt(obj.css("left")),
            maxSize=parseInt(obj.css("width"))-728;

            if(-left<maxSize){
                obj.animate({
                    left:(left-104)+"px"
                });
            }
        },
        _prev:function(){
            var obj=this.get("triggers").find(".main-sub-nav-list"),
            left=parseInt(obj.css("left"));

            if(-left>0){
                obj.animate({
                    left:(left+104)+"px"
                });
            }
        },
        _subNext:function(){ //子菜单 下一个功能方法
            var obj=this.get("triggers").find(".main-sub-nav2-list"),
            left=parseInt(obj.css("left")),
            maxSize=parseInt(obj.css("width"))-936;

            if(-left<maxSize){
                obj.animate({
                    left:(left-104)+"px"
                });
            }
        },
        _subPrev:function(){ //子菜单 上一个功能方法
            var obj=this.get("triggers").find(".main-sub-nav2-list"),
            left=parseInt(obj.css("left"));

            if(-left>0){
                obj.animate({
                    left:(left+104)+"px"
                });
            }
        }
    });
	module.exports = Menu;

    function bindEvent(type, element, fn, delegateNode, context) {

        var hasDelegateNode = delegateNode && delegateNode[0];
        context.delegateEvents(hasDelegateNode ? delegateNode : element, hasDelegateNode ? type + " " + element.selector : type, function(e) {
            fn.call(e.currentTarget, e);
        });
    };
});

