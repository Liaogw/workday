define("range",["$", "widget", "base", "class", "events","./range-debug.css"],function(require, exports, module){

    var $=require("$");
    var Widget = require("widget");
    require("./range-debug.css");
	var Range=Widget.extend({
		attrs: {
             // 可以是 Selector、jQuery 对象、或 DOM 元素集
            triggers: {
                value: '',
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
            minValue:-10,
            maxValue:100,
            mouseType:'default',
            unit:'',//单位
            lattice:10,//整个range分多少条
            actualValue:0,//开始展示值
            defaultValue:0,//range默认值，每次重置都会重置为默认值
            decimal:0, //默认显示小数点后几位，默认0位
            // 初始切换到哪个面板
            activeIndex: {
                value: 0
            }
        },
        events: {
            'mousedown .range-slider-container': 'onStart',
            'mouseup .range-slider-container' :'onEnd',
            'mouseout .range-slider-container':'unbindEvent',
            'click .range .prev':'onPrev',
            'click .range .next':'onNext'
        },
        setup:function(){
            var actualValue = this.get("actualValue"),
                minValue = this.get("minValue"),
                maxValue = this.get("maxValue");

    
            if(actualValue< minValue || actualValue >maxValue){
                alert("初始值不能小于最小设定值 或大于最大设定值");
                return false;
            }
        	this.init();
            this.resize(actualValue);
        },
        resize:function(value){
            var rangeSub=this.element.find(".range-slider-sub");
            var width = parseInt(this.element.find(".range-slider").css("width")),
                totalValue= this.get("maxValue") - this.get("minValue"),
                rangeWidth=((value-this.get("minValue"))/totalValue) * width;

            this.set("actualValue",value);
            this.locate(rangeWidth);
        },
        render:function(value){
            if(value){
                this.set("defaultValue",value);
            }
            this.resize(this.get("defaultValue"));
        },
        init:function(){
            var strhtml="<div class=\"range\">";
            strhtml+="  <a class=\"prev\"></a>";
            strhtml+="  <div class=\"range-slider-container\">";
            strhtml+="      <div class=\"range-slider\">";
            strhtml+="          <div class=\"range-slider-sub\"></div>";
            strhtml+="          <span class=\"range-slider-handle\"><span class=\"range-value\"></span></span>";            
            strhtml+="      </div>";
            strhtml+="  </div>";
            strhtml+="  <a class=\"next\"></a>";
            strhtml+="</div>";

            this.element.html(strhtml);
        },
        onStart:function(e){
            var minValue =this.get("minValue"),
                maxValue =this.get("maxValue"),
                unit =this.get("unit"),
                lattices =this.get("lattice"),
                totalValue= maxValue - minValue,
                mouseType =this.get("mouseType"),
                decimal =this.get("decimal");

            this.element.find(".range-slider-container").bind("mousemove",function(e){
                var rangeSub=$(this).find(".range-slider-sub");                      
                var rangeWidth=e.clientX-rangeSub.offset().left,
                    width = parseInt($(this).find(".range-slider").css("width"));

                if(rangeWidth<0){
                    rangeWidth=0;
                }
                if(rangeWidth>214){
                    rangeWidth=214;
                }
                if(mouseType=="lattice"){
                    var count=Math.round(rangeWidth/width*lattices);
                    rangeWidth=count *(width/lattices);
                }

                $(this).find(".range-value").html(((rangeWidth/width)*totalValue + minValue).toFixed(decimal) + unit);
                rangeSub.css("width",rangeWidth + "px");
                $(this).find(".range-slider-handle").css("left",(rangeWidth-8) + "px");  
            });
        },
        onEnd:function(e){
            this.element.find(".range-slider-container").unbind("mousemove");
            var rangeSub=this.element.find(".range-slider-sub");
            var rangeWidth=e.clientX-rangeSub.offset().left,
                width = parseInt(this.element.find(".range-slider").css("width")),
                totalValue= this.get("maxValue") - this.get("minValue"),
                lattices =this.get("lattice"),
                mouseType =this.get("mouseType");
            
            console.log(mouseType);      
            if(rangeWidth<0){
                rangeWidth=0;
            }
            if(rangeWidth>214){
                rangeWidth=214;
            }
            if(mouseType=="lattice"){
                var count=Math.round(rangeWidth/width*lattices);
                rangeWidth=count *(width/lattices);
            }
            this.set("actualValue",((rangeWidth/width)*totalValue + this.get("minValue")));
            this.locate(rangeWidth);
        },
        unbindEvent:function(){
            this.element.find(".range-slider-container").unbind("mousemove");
        },
        onPrev:function(e){
            var width = parseInt($(this.element.selector).find(".range-slider").css("width")),
                lattices =this.get("lattice"),
                lattice =width/lattices,
                rangeSub=$(this.element.selector).find(".range-slider-sub"),
                rangeWidth=parseInt(rangeSub.css("width")) -lattice,
                totalValue= this.get("maxValue") - this.get("minValue"),
                actualValue =this.get("actualValue"),
                newValue=actualValue- (totalValue/lattices);
            
            if(rangeWidth<0){
                rangeWidth=0;
            }
            if(newValue < this.get("minValue")){
                newValue= this.get("minValue")
            }
            this.set("actualValue",newValue);
            this.locate(rangeWidth);
        },
        onNext:function(e){
            var width = parseInt($(this.element.selector).find(".range-slider").css("width")),
                lattices =this.get("lattice"),
                lattice =width/lattices,
                rangeSub=$(this.element.selector).find(".range-slider-sub"),
                rangeWidth=parseInt(rangeSub.css("width")) + lattice,
                totalValue= this.get("maxValue") - this.get("minValue"),
                actualValue =this.get("actualValue"),
                newValue=actualValue + (totalValue/lattices);

            if(rangeWidth>214){
                rangeWidth=214;
            }
            if(newValue > this.get("maxValue")){
                newValue= this.get("maxValue")
            }
            this.set("actualValue",newValue);           
            this.locate(rangeWidth);
        },
        locate:function(value){
            $(this.element.selector).find(".range-value").html(this.get("actualValue").toFixed(this.get("decimal"))  + this.get("unit"));
            $(this.element.selector).find(".range-slider-sub").css("width",value + "px");
            $(this.element.selector).find(".range-slider-handle").css("left",(value-8) + "px");
        }
	});
	module.exports = Range;
});