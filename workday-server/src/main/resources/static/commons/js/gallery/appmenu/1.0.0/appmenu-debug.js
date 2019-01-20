define("appmenu",["$", "widget", "base", "class", "events","easing","./appmenu-debug.css"],function(require, exports, module){


	var $=require("$");
	var Widget = require("widget");
    require("./appmenu-debug.css");
	var AppMenu=Widget.extend({
        attrs: {
             // 可以是 Selector、jQuery 对象、或 DOM 元素集
            triggers: {
                value: '.appmenu-nav li',
                getter: function(val) {
                    return $(val);
                }
            },
            panels: {
                value: '.appmenu-page .appmenu-page-item',
                getter: function(val) {
                    return $(val);
                }
            },
            subs:{
                value:'.appmenu-sub',
                getter:function(val){
                    return $(val);
                }
            },
            defaultIcon:'../../resources/portal/css/img/changnei.png',
            // 是否包含 triggers，用于没有传入 triggers 时，是否自动生成的判断标准
            hasTriggers: true,
            // 触发类型
            triggerType: "click",
            // or 'click'
            // 触发延迟
            delay: 100,
            // 初始切换到哪个面板
            activeIndex: {
                value: 0
            }
        },
        events: {
            'click .appmenu-nav li': '_paging',
            'click .appmenu-page .appmenu-list-item' :'_openSubMenu',
            'click .appmenu-sub .left':'_subPrev',
            'click .appmenu-sub .right':'_subNext'
        },
        setup:function(){ //装载appmenu方法，new出appmenu属性后  自动调用
            this._initHtml();
            this._initPage();
            this.get("panels").hide();
            this.switchTo(this.get("activeIndex"));
            this._initSubMenu();
        },
        _initHtml:function(){ //初始化第一级菜单html
            var strhtml="<ul class=\"appmenu-page\">",
                url="",
                rows=1,iconUrl,
                css,
                ItemClass=""
                data=this.get("model");
            this.size =0;
           
            for(var intCount in data){
                rows = (rows>12)? 1 : rows;
                url="";
                if(rows ==1){
                    this.size++;
                    strhtml += "<li class=\"appmenu-page-item\"  data-page=\""+ this.size +"\">";
                    strhtml += "    <ul class=\"appmenu-list cl\">";
                };
                ItemClass =(rows>8) ? "appmenu-no-bg" :"";
                if(data[intCount].url !="undefined" && data[intCount].url != null && data[intCount].url != ""){
                    url="href=\""+ data[intCount].url +" \" target=\"_blank\"";
                }
                if(data[intCount]["iconUrl"]){
                    iconUrl=data[intCount]["iconUrl"];
                }else{
                    iconUrl=this.get("defaultIcon");
                }
                strhtml+="      <li class=\"appmenu-list-item "+ ItemClass +"\" data-rows=\""+ intCount +"\"><a class=\"appmenu-list-a\" "+ url +" ><img src=\""+ iconUrl +"\"></a><p>"+ data[intCount]["name"] +"</p></li>"
                if (rows ==12) {
                    strhtml += "    </ul>"
                    strhtml += "</li>";
                };
                rows++;
            }
            if(rows <=12){
                strhtml += "    </ul>"
                strhtml += "</li>";
            }
            strhtml +="</ul>";

            this.element.html(strhtml);
        },
        _initSubMenu:function(){ //初始化子集菜单pannel
            var strhtml="";

            strhtml+="<div class=\"appmenu-sub\">";
            strhtml+="  <em class=\"top\"></em>";
            strhtml+="  <i class=\"left\"></i>";
            strhtml+="  <i class=\"right\"></i>";
            strhtml+="  <div class=\"appmenu-sub-content\" >";
            strhtml+="      <ul class=\"appmenu-sub-list cl\"></ul>";
            strhtml+="  </div>";
            strhtml+="</div>";
            this.element.append(strhtml);
        },
        _initPage:function(){ //初始化第一级菜单翻页
            var strhtml =" <ul data-role=\"nav\" class=\"appmenu-nav\">";
            for(var i=0;i<this.size;i++){
                if(i==0){
                    strhtml +="  <li class=\"appmenu-trigger appmenu-active\" data-page=\""+ (i+1) +"\">●</li>";
                }else{
                    strhtml +="  <li class=\"appmenu-trigger\" data-page=\""+ (i+1) +"\">●</li>";
                }
            }
            strhtml+="</ul>";
            this.element.append(strhtml);
        },
        _onRenderActiveIndex:function(val,prev){ //当属性active改变时 自动调用此方法对第一级菜单翻页
            var triggers=this.get("triggers"),
                panels=this.get("panels"),
                subs=this.get("subs");
            triggers.eq(prev).removeClass("appmenu-active");
            triggers.eq(val).addClass("appmenu-active");

            subs.hide();
            panels.eq(prev).hide();
            panels.eq(val).show();
        },
        _paging:function(e){//第一级菜单翻页，调用swicthTo方法改变active属性
            var index = this.get("triggers").index(e.target);
            this.switchTo(index);
        },
        switchTo:function(index){ //改变acitve属性 自动调用_onRenderActiveIndex翻页
            this.set("activeIndex",index);
        },
        _openSubMenu:function(e){//打开子菜单
            var subs=this.get("subs"),
                nodeName=e.target.nodeName,
                index;
             if (nodeName =="LI") {
                index=$(e.target).attr("data-rows")
             }
             if(nodeName=="IMG"){
                index=$(e.target).parent().parent().attr("data-rows");
             }   
             if(nodeName=="A" || nodeName == "P"){
                 index=$(e.target).parent().attr("data-rows");
             }
           
            this._getSubMenu(index);
        },
        _setSubPosition:function(index){ //改变子菜单pannel的位置
            var subs=this.get("subs"),
                order=index%12;

            if(order>3 && order<8){
                subs.css("top","358px");
            }else{
                subs.css("top","179px");
            }

            if(order>=8){
                subs.find("em").removeClass("top");
                subs.find("em").addClass("bottom");
            }else{
                subs.find("em").removeClass("bottom");
                subs.find("em").addClass("top");
            }
            
            subs.find("em").css("left",(100 + parseInt((order%4)*150))+"px");

        },
        _getSubMenu:function(index){ //获取点击的第一级菜单的子菜单 加载进子菜单pannle中来
            var subs=this.get("subs"),
                data=this.get("model")[index],
                strhtml="";
            console.log(index);
            if(data.url !="undefined" && data.url != null && data.url != ""){

                subs.hide();
                return false;
            }else{
                if(data.child =="undefined"|| data.child =="" || data.child ==null){
                    subs.hide();
                    alert("没有子菜单");
                    return false;
                }
            }
           
            for(var intCount in data.child){
                strhtml+="<li class=\"appmenu-sub-list-item\"><a class=\"appmenu-sub-list-c\" href=\""+ data.child[intCount].url +"\" target=\"_blank\"></a><p>"+ data.child[intCount].name +"</p></li>"
            }
            if(data.child.length<4){
                subs.find("i").hide();
            }else{
                subs.find("i").show();
            }
            this._setSubPosition(index);
            subs.find(".appmenu-sub-list").css("left","0px");
            subs.find(".appmenu-sub-list").css("width",(150*data.child.length) + "px");
            subs.find(".appmenu-sub-list").html(strhtml);
            subs.show();
        },
        _subNext:function(){ //子菜单 下一个功能方法
            var subs=this.get("subs"),
            left=parseInt(subs.find(".appmenu-sub-list").css("left")),
            maxSize=parseInt(subs.find(".appmenu-sub-list").css("width"))-600;

            if(-left<maxSize){
                subs.find(".appmenu-sub-list").animate({
                    left:(left-150)+"px"
                });
            }
        },
        _subPrev:function(){ //子菜单 上一个功能方法
            var subs=this.get("subs"),
            left=parseInt(subs.find(".appmenu-sub-list").css("left"));

            if(-left>0){
                subs.find(".appmenu-sub-list").animate({
                    left:(left+150)+"px"
                });
            }
        }
    });
	module.exports = AppMenu;

})
