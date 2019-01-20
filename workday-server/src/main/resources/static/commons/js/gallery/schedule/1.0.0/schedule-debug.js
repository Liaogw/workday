define("schedule", ["$","./i18n-debug","./schedule-debug.css","dialog"], function(require, exports, module) {
    var $=require("$");
    require("./schedule-debug.css");
    var i18n = require("./i18n-debug");
    var Dialog =require("dialog");
    var def,set;
    Schedule=function(opts){
        def = {
            weekStart: 0,
            weekName: [i18n.datepicker.dateformat.sun, i18n.datepicker.dateformat.mon, i18n.datepicker.dateformat.tue, i18n.datepicker.dateformat.wed, i18n.datepicker.dateformat.thu, i18n.datepicker.dateformat.fri, i18n.datepicker.dateformat.sat], //week language support
            monthName: [i18n.datepicker.dateformat.jan, i18n.datepicker.dateformat.feb, i18n.datepicker.dateformat.mar, i18n.datepicker.dateformat.apr, i18n.datepicker.dateformat.may, i18n.datepicker.dateformat.jun, i18n.datepicker.dateformat.jul, i18n.datepicker.dateformat.aug, i18n.datepicker.dateformat.sep, i18n.datepicker.dateformat.oct, i18n.datepicker.dateformat.nov, i18n.datepicker.dateformat.dec],
            monthp: i18n.datepicker.dateformat.postfix,
            Year: new Date().getFullYear(), //default year
            Month: new Date().getMonth() + 1, //default month
            Day: new Date().getDate(), //default date
            today: new Date(),
            time: new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(),
            showValue:'',
            minDate:"1900-01-01 00:00:00",
            maxDate:"2099-12-31 23:59:59",
            version: "1.1",
            applyrule: false, //function(){};return rule={startdate,endate};
            showtarget: null,
            dateformat: "yyyy-MM-dd",
            enablePicker: true,
            defaultToday: false
        };
        this.opts=opts;
        this.init();

        $(".nowMonth").click(function(){
            Schedule.prototype.getNow();
        });
        $(".prevMonth").click(function(){
            Schedule.prototype.prevMonth();
        });
        $(".nextMonth").click(function(){
            Schedule.prototype.nextMonth();
        });
        
    };
    Schedule.prototype={
        constructor:Schedule, 
        init:function(){

            set = $.extend({ 
                trigger:$("#BBIT_DP_INNER1"),
                showType: 1,//1.正常模式，2.dialog弹窗,
                dialogUrl: "",//dialog弹窗模式url地址
                dialogWidth: "760px",//dialog弹窗宽度
                dialogHeight:"300px",//dialog弹窗高度
                lunarUrl:"",//传入取农历数据地址，默认空，不展示农历日期
                dataUrl:"",//传入取日程数据地址，默认空
                weatherUrl:"",//传入取天气数据地址，默认空
                operate:"",//传入日程安排新增编辑地址，默认空，由本地直接弹出pannel层进行编辑
            },this.opts||{}); 

            if(set.dialogUrl !="" && set.dialogUrl != "undefined" && set.dialogUrl != null){
                set.showType=2;
            }
            var tdc ="";
            var strhtml ="<div class=\"today-info\">";
                strhtml +=" <ul class=\"info-items\">";
                strhtml +="     <li class=\"info-item first\"><span>今天:</span></li>";
                strhtml +="     <li class=\"info-item info-item-border\"><span>"+ def.Year + "年" + def.Month + "月" + def.Day + "日 " + def.time  +"</span></li>";
                strhtml +="     <li class=\"info-item info-item-border\"><span>农历<span></li>";
                strhtml +="     <li class=\"info-item info-item-border\"><span>天气预报<span></li>";
                strhtml +="     <li class=\"info-item\"><span>罗源湾 纬度:6°28'N 经度:119°41'E<span></li>";
                strhtml +=" </ul>";
                strhtml +=" <ul class=\"schedule-legend\">";
                strhtml +="     <li>图例:</li>";
                strhtml +="     <li><i style=\"background:#ff6c00\"></i><span>预计到达时间</span></li>";
                strhtml +="     <li><i style=\"background:#4ac500\"></i><span>预计靠港时间</span></li>";
                strhtml +=" </ul>";
                strhtml +="</div>";
                strhtml +="<div class=\"date-operate\">";
                strhtml +=" <ul class=\"schedule-type\">";
                strhtml +="     <li class=\"selected\"><span>主题</span></li>";
                strhtml +="     <li><span>主题</span></li>";
                strhtml +="     <li><span>主题</span></li>";
                strhtml +=" </ul>";
                strhtml +=" <ul class=\"operate-items\">";
                strhtml +="     <li><label class=\"lbDate\"></label></li>";
                strhtml +="     <li><input type=\"button\" value=\"今天\" class=\"nowMonth\"></li>";
                strhtml +="     <li><input type=\"button\" value=\"<\" class=\"prevMonth\"></li>";
                strhtml +="     <li><input type=\"button\" value=\">\" class=\"nextMonth\"></li>";
                strhtml +=" </ul>";
                strhtml +="</div>";
                strhtml +="<table id=\"schedule-table\" style=\"width:100%;\" cellspacing=\"0\">";
                strhtml +="  <thead>";
                strhtml +="     <tr>";
                for(var i=0;i<def.weekName.length;i++){
                    tdc="";
                    if(i==0 || i==6){
                        tdc="schedule-weekend"
                    }
                    strhtml += "    <td class="+ tdc +">"+def.weekName[i]+"</td>";
                }
                strhtml +="     </tr>";
                strhtml +="  </thead>";
                strhtml +="  <tbody>";
                strhtml +="  </tbody>";
                strhtml +="</table>";
				strhtml +="<div id=\"pannel\"></div>";
			
			this.calculate();
			this.getData();
            set.trigger.html(strhtml);
           
        
            this.show();
            this.showSchedule(def.scheduleData);
            this.bindCell();
            this.pannelInit();

          
        },
        pannelInit:function(){
            var strhtml ="<div class=\"schedule-pannel\">";
                strhtml +="  <div class=\"schedule-container\">";
                strhtml +="     <div class=\"schedule-content\">";
                strhtml +="         <div class=\"event-row event-view\">";
                strhtml +="             <label class=\"event-left\">内容:</label>";
                strhtml +="             <span class=\"event-right\">/span>";
                strhtml +="         </div>";
                strhtml +="         <div class=\"event-row\">";
                strhtml +="             <label class=\"event-left\">时间:</label>";
                strhtml +="             <span class=\"event-right event-date\">2013-8-4</span>";
                strhtml +="         </div>";
                strhtml +="         <div class=\"event-row event-add\">";
                strhtml +="             <label class=\"event-left\">内容:</label>";
                strhtml +="             <input tabindex='0' type='text' class=\"iptContent\">";
                strhtml +="         </div>";
                strhtml +="         <div class=\"event-row event-add\">";
                strhtml +="             <label class=\"event-left\"></label>";
                strhtml +="              <span class=\"event-right\">例如:晚上7点在pancho's吃晚餐</span>";
                strhtml +="         </div>";       
                strhtml +="     </div>";
                strhtml +="     <div class=\"schedule-operate\">";
                strhtml +="         <a class=\"btn-gray btn-add\">确定</a>";
                strhtml +="         <a class=\"btn-gray btn-close\" >关闭</a>";
                strhtml +="     </div>"
                strhtml +="  </div>";
                strhtml +="  <div class=\"schedule-arrow\">";
                strhtml +="     <div class=\"arrow-dk\"></div>";
                strhtml +="     <div class=\"arrow-lt\"></div>";
                strhtml +="  </div>";
                strhtml +="</div>";

            set.trigger.find("#pannel").html(strhtml);
            this.pannelBind();    
        },
        getData:function(){
            var startDate= dateFormat.call(def.startDate, "yyyyMMdd").toString(),
                endDate =dateFormat.call(def.endDate, "yyyyMMdd").toString();
            $.ajaxSetup({  
                async : false  
            });  
            $.post(
                    set.dataUrl,{startTime:startDate,endTime:endDate},
                    function(data){
                        def.scheduleData=data;
                    }
            );
             $.ajaxSetup({  
                async : true  
            }); 
        },
        pannelBind:function(){
            $(".btn-close").click(function(){
                $(".schedule-pannel").hide();
            });
            $(".btn-add").click(function(){

                Schedule.prototype.addSchedule();
            });
        },
        showSchedule:function(data){
            var strhtml="",
                xdate="",
                obj,moreList;
            for(var intCount in data){

                strhtml ="<div class=\"te\" dmId=\""+ data[intCount].dmId +"\">";
                strhtml +=" <span class=\"te-t\">"+ data[intCount].dmSt +"</span>";
                strhtml +=" <span class=\"te-s\" title=\""+ data[intCount].dmName +"\">"+ data[intCount].dmName +"</span>";
                strhtml +="</div>";
                if(xdate != data[intCount].dmDate){
                    xdate =data[intCount].dmDate;
                }
                obj= set.trigger.find("div[xdate="+ xdate +"]").find(".schedule-list"),
                moreList=set.trigger.find("div[xdate="+ xdate +"]").find(".schedule-more-list");

                if(obj.find(".te").length>=4){
                    var otherHtml="<div class=\"te-other \">";
                    otherHtml+=" <span class=\"te-t te-more\">另外"+ (moreList.find(".te").length-3) +"条</span>";
                    otherHtml+="</div>";
                    if(obj.find(".te-more").length>0){
                        var conunt=moreList.find(".te").length-3;
                        obj.find(".te-more").html("另外"+ conunt +"条");
                        
                    }else{
                        obj.append(otherHtml);
                    }
                }else{
                    obj.append(strhtml);
                }
                moreList.append(strhtml);
                xdate =data[intCount].dmDate;
            }
        },
        add:function(xdate,xtime,xtitle,dmId){
            var strhtml="";

            strhtml +="<div class=\"te\" dmId=\""+ dmId +"\">";
            strhtml +=" <span class=\"te-t\">"+ xtime +"</span>";
            strhtml +=" <span class=\"te-s\" title=\""+ xtitle +"\">"+ xtitle +"</span>";
            strhtml +="</div>";

            var obj= set.trigger.find("div[xdate="+ xdate +"]").find(".schedule-list"),
                moreList=set.trigger.find("div[xdate="+ xdate +"]").find(".schedule-more-list");
          
            if(obj.find(".te").length>=4){
                var otherHtml="<div class=\"te-other \">";
                    otherHtml+=" <span class=\"te-t te-more\">另外"+ (moreList.find(".te").length-3) +"条</span>";
                    otherHtml+="</div>";
                    if(obj.find(".te-more").length>0){
                        var conunt=moreList.find(".te").length-3;
                        obj.find(".te-more").html("另外"+ conunt +"条");
                        
                    }else{
                        obj.append(otherHtml);
                    }
                    
            }else{
                obj.append(strhtml);
            }
            
            moreList.append(strhtml);
            $(".schedule-pannel").hide();
        },
        addSchedule:function(){
            var xtime=new Date().toLocaleTimeString(),
                xdate=$(".event-date").html();
                xtitle=$(".iptContent").val();

                this.add(xdate,xtime,xtitle,Math.random()*100);
                
        },
        calculate:function(){
            def.firstDate = new Date(def.Year,def.Month-1,1);
            def.lastDate = new Date(def.Year,def.Month,0);
            def.diffDay =def.weekStart - def.firstDate.getDay();
            def.showMonth = def.Month-1;
            def.startDate =DateAdd("d",def.diffDay,def.firstDate);
            def.endDate=DateAdd("d", 42, def.startDate);
            def.showDay =(def.lastDate.getDay()>0)?35:42;
            def.tds =   dateFormat.call(def.today, i18n.datepicker.dateformat.fulldayvalue);
            if ( def.diffDay  > 0) {
                 def.diffDay  -= 7;
            }
            def.showValue= def.Year + "年" + def.Month + "月";
         
        },
        show:function(){
            var tb = $(set.trigger).find("tbody"),
            bhm = [],
            tdc = [],
            weekclass="";

            for (var i = 1; i <= def.showDay; i++) {
                if (i % 7 == 1) {
                    bhm.push("<tr>");
                }

                var ndate = DateAdd("d", i - 1, def.startDate);
                tdc = [];
                weekclass="schedule-date ";
                if(i%7==1 || i%7 ==0){
                    weekclass+="schedule-weekend";
                };
                if (ndate.getMonth() < def.showMonth) {
                    tdc.push("schedule-dp-prevday");
                }
                else if (ndate.getMonth() > def.showMonth) {
                    tdc.push("schedule-dp-nextday");
                }
             
               tdc.push("schedule-dp-active");
               
                var s = dateFormat.call(ndate, i18n.datepicker.dateformat.fulldayvalue);
                if (s == def.tds) {
                    tdc.push("schedule-dp-today");
                }
              
                bhm.push("<td class='", tdc.join(" "), "'  >");
                bhm.push("  <div class=\"cell-date\" xdate='", dateFormat.call(ndate, i18n.datepicker.dateformat.fulldayvalue), "'>");
                bhm.push("      <div class=\"cell-date-title\">");
                bhm.push("          <span class=\""+  weekclass+"\">", ndate.getDate(), "</span>");
                bhm.push("          <span class=\"schedule-lunar\">农历</span>");
                bhm.push("          <span class=\"schedule-weather\"><i class=\"iconfont\">&#x0038;</i></span>");
                bhm.push("      </div>");
                bhm.push("      <div class=\"schedule-list\"></div>");
                bhm.push("      <div class=\"schedule-more\">");
                bhm.push("          <div class=\"schedule-more-titlebar\">");
                bhm.push("              <div class=\"schedule-more-title\"><span class=\"schedule-more-title-cnt\">", def.showValue , "</span></div>");
                bhm.push("              <div class=\"schedule-more-close\" title=\"关闭\">x</div>");
                bhm.push("          </div>");
                bhm.push("          <div class=\"schedule-more-list\"></div>");
                bhm.push("      </div>");
                bhm.push("  </div>");
                bhm.push("</td>");
                if (i % 7 == 0) {
                    bhm.push("</tr>");
                }
            }

            tb.html(bhm.join(""));
            $(".lbDate").html(def.showValue);
        },
        prevMonth:function(){
            if (def.Month<=1) {
                def.Month=12;
                def.Year=def.Year-1;
            }else{
                def.Month=def.Month-1;
            };     
            this.calculate();
            this.getData();
            this.show();
            this.showSchedule(def.scheduleData);
        },
        nextMonth:function(){
            if(def.Month>=12){
                def.Month=1;
                def.Year=def.Year+1;
            }else{
                def.Month=def.Month+1;
            };
                
            this.calculate();
            this.getData();
            this.show();
            this.showSchedule(def.scheduleData);
        },
        getNow:function(){
            def.Month=new Date().getMonth() + 1;
            def.Year=new Date().getFullYear();

            this.calculate();
            this.getData();
            this.show();
            this.showSchedule(def.scheduleData);
        },
        switchMonth:function(year,month){
            def.Month = month;
            def.Year = year;

            this.calculate();
            this.getData();
            this.show();
            this.showSchedule(def.scheduleData);
        },
        bindCell:function(){
            var tb = $(set.trigger).find("tbody"),
                xdate,dmId,xleft,xtop,obj;
            if(set.showType ==2){
                new Dialog({
                            trigger: tb.find("td"),
                            height: set.dialogHeight,
                            width:set.dialogWidth,
                            content:   set.dialogUrl  }).before("show",function(e){
                                e=e||window.event;
                                var obj =$(e.target),
                                    content,dmId;
                                if(obj.is(".te-more")||obj.is(".schedule-more-close")
                                    ||obj.is(".schedule-more-titlebar") || obj.is(".schedule-more-title")
                                    || obj.is(".schedule-more-title-cnt")|| obj.is(".cell-date-title")
                                    || obj.is(".schedule-date")||obj.is(".schedule-lunar")||obj.is(".schedule-weather")){
                                    return false;
                                }
                                xdate= this.activeTrigger.find(".cell-date").attr("xdate");
                                content = set.dialogUrl + "flag=add&dmDate=" + xdate;
                                
                                if(obj.is(".te-t")){
                                    dmId =obj.parent().attr("dmId");
                                }
                                if(obj.is(".te-s")){
                                    dmId =obj.parent().attr("dmId");
                                }
                                if(obj.is(".te")){
                                    dmId =obj.attr("dmId");
                                }
                                if(dmId !="" && dmId != "undefined" && dmId !=null){
                                    content =set.dialogUrl + "flag=edit&dmDate=" + xdate + "&dmId=" + dmId;
                                }

                                this.set('content', content);
                });
            }
            tb.click(function(e){
				
                xdate= $(e.target).parent().attr("xdate");
               
                obj=$(e.target);
                xleft= e.clientX +"px";
                xtop = (e.clientY-26) +"px";
                if(obj.is(".cell-date-title")){
                    return;
                }
                /*显示更多日程安排*/
                if(obj.is(".te-more")){
                    obj.parent().parent().next().show();
                    return;
                }
                /*关闭更多日程安排*/
                if(obj.is(".schedule-more-close")){
                    obj.parent().parent().hide();
                    return;
                }
                if(obj.is(".schedule-more-titlebar") || obj.is(".schedule-more-title")|| obj.is(".schedule-more-title-cnt")){
                	return;
                }
                if(obj.is(".te")||obj.is(".te-t")||obj.is(".te-s")){
               
                    $(".event-view").show();
                    $(".event-add").hide();
                    var strcnt="";
                    if(obj.is(".te-t")){
                        strcnt = obj.next().html();
                    	xdate= obj.parent().parent().parent().attr("xdate");
                    	dmId =obj.parent().attr("dmId");
                    }
                   
                    
                    if(obj.is(".te-s")){
                        strcnt = obj.html();
                    	xdate= obj.parent().parent().parent().attr("xdate");
                    	dmId =obj.parent().attr("dmId");
                    }
                    if(obj.is(".te")){
                        strcnt = obj.find(".te-s").html(); 	
                        xdate= obj.parent().parent().attr("xdate");
                        dmId =obj.attr("dmId");
                    }

                    if(set.operate ==""){
                        $(".schedule-pannel").css("height","180px");
                        $(".event-view").find(".event-right").html(strcnt);
                        $(".event-date").html(xdate);
                        $(".schedule-pannel").css("left",xleft);
                        $(".schedule-pannel").css("top",xtop);
                        $(".btn-add").hide();
                        $(".schedule-pannel").show();
                    }else{
                        if(set.showType ==1){
                            window.location.href=set.operate + "?flag=edit&dmId="+ dmId +"&dmDate=" + xdate;
                        }
                    }
                    return;
                }
                if(set.operate ==""){
                    
                    $(".schedule-pannel").css("height","200px");
                    $(".btn-add").show();
                    $(".event-view").hide();
                    $(".event-add").show();
                    $(".iptContent").val("");
                    $(".event-date").html(xdate);
                    $(".schedule-pannel").css("left",xleft);
                    $(".schedule-pannel").css("top",xtop);
                    $(".schedule-pannel").show();

                }else{
                    if(set.showType ==1){
                        window.location.href=set.operate + "?flag=add&dmDate=" + xdate;
                    }
                }
				
                
            })
        }
    }
    var DateAdd = function (interval, number, idate) {
        number = parseInt(number);
        var date;
        if (typeof (idate) == "string") {
            date = idate.split(/\D/);
            eval("var date = new Date(" + date.join(",") + ")");
        }

        if (typeof (idate) == "object") {
            date = new Date(idate.toString());
        }

        switch (interval) {
            case "y": date.setFullYear(date.getFullYear() + number); break;
            case "m": date.setMonth(date.getMonth() + number); break;
            case "d": date.setDate(date.getDate() + number); break;
            case "w": date.setDate(date.getDate() + 7 * number); break;
            case "h": date.setHours(date.getHours() + number); break;
            case "n": date.setMinutes(date.getMinutes() + number); break;
            case "s": date.setSeconds(date.getSeconds() + number); break;
            case "l": date.setMilliseconds(date.getMilliseconds() + number); break;
        }
        return date;
    }
    var DateDiff = function (interval, d1, d2) {
        switch (interval) {
            case "d": //date
            case "w":
                d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
                d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
                break;  //w
            case "h":
                d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours());
                d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours());
                break; //h
            case "n":
                d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), d1.getMinutes());
                d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes());
                break;
            case "s":
                d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), d1.getMinutes(), d1.getSeconds());
                d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds());
                break;
        }
        var t1 = d1.getTime(), t2 = d2.getTime();
        var diff = NaN;
        switch (interval) {
            case "y": diff = d2.getFullYear() - d1.getFullYear(); break; //y
            case "m": diff = (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth(); break;    //m
            case "d": diff = Math.floor(t2 / 86400000) - Math.floor(t1 / 86400000); break;
            case "w": diff = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t1 + 345600000) / (604800000)); break; //w
            case "h": diff = Math.floor(t2 / 3600000) - Math.floor(t1 / 3600000); break; //h
            case "n": diff = Math.floor(t2 / 60000) - Math.floor(t1 / 60000); break; //
            case "s": diff = Math.floor(t2 / 1000) - Math.floor(t1 / 1000); break; //s
            case "l": diff = t2 - t1; break;
        }
        return diff;
    }
    var dateFormat = function (format) {
        var o = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "H+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "w": "0123456".indexOf(this.getDay()),
            "S": this.getMilliseconds()
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
        return format;
    }; 
    module.exports = Schedule;
});

define("gallery/schedule/1.0.0/i18n-debug", [], function(require, exports,module) {
    var i18 = {
        datepicker: {
            dateformat: {
                "fulldayvalue": "yyyy-MM-dd",
                "separator": "-",
                "year_index": 0,
                "month_index": 1,
                "day_index": 2,
                "sun": "周日",
                "mon": "周一",
                "tue": "周二",
                "wed": "周三",
                "thu": "周四",
                "fri": "周五",
                "sat": "周六",
                "jan": "一",
                "feb": "二",
                "mar": "三",
                "apr": "四",
                "may": "五",
                "jun": "六",
                "jul": "七",
                "aug": "八",
                "sep": "九",
                "oct": "十",
                "nov": "十一",
                "dec": "十二",
                "postfix":"月"
            },
            ok: " 確定 ",
            cancel: " 取消 ",
            today: "今天",
            prev_month_title:"上一月",
            next_month_title:"下一月",
            prev_year_title:"上一年",
            next_year_title:"下一年"
        }
    };
    module.exports = i18;
});

