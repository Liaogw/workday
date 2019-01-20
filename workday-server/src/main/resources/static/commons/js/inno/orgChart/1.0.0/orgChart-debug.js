define("inno/orgChart/1.0.0/orgChart-debug",["$","./jquery-ui-debug","./orgChart-debug.css"],function(require, exports, module){
	var $=require("$");
	require("./jquery-ui-debug");
	require("./orgChart-debug.css");
	(function ($) {
        var isIE6_7 = false;
        $.fn.jOrgChart = function (options) {
            //通过特性简单判断是否为IE6_7浏览器
            isIE6_7 = navigator.appVersion.indexOf('MSIE 7.') > -1 ||
                typeof document.body.style.maxHeight === 'undefined';

            var orgChart = $.fn.jOrgChart;
            var opts = $.extend({}, orgChart.defaults, options);

            // build the tree
            var $this = $(this),
                 Util = orgChart.util.init($this, opts).refresh();
            
            // add drag and drop if enabled
            
        };

        // Option defaults
        $.fn.jOrgChart.defaults = {
            nodeData: [],
            chartElement: 'body',
            depth: -1,
            chartClass: "jOrgChart",
            dragAndDrop: false,
            onSelected: null,
            showStatus:false,
            preventDefault: false//是否阻止默认选择事件
        };

        $.fn.jOrgChart.util = {
            _chart: null,
            _nodeCount: 0,
            _Instance: null,
            init: function (chart, opts) {
                var self = this;
                self._chart = chart;
                return self._Instance = {
                    nodeCount: self._nodeCount,
                    option: opts,
                    chart: self._chart,
                    buildNode: self.buildNode,
                    refresh: self.refresh,
                    drawLine: self.drawLine
                }
            },
            //===递归形成树型节点，此函数为核心函数
            buildNode: function ($nodeList, $appendTo, level, opts) {
                var self = this, //orgChart
                    mouseStatus=true;
                for (var i = 0, len = $nodeList.length; i < len; i++) {
                    var $node = $nodeList[i];
                    var $table = $("<table cellpadding='0' cellspacing='0' border='0'/>"),
                       $tbody = $("<tbody/>");

                    // Construct the node container(s)
                    var $nodeRow = $("<tr/>").addClass("node-cells");
                    var $nodeCell = $("<td/>").addClass("node-cell").attr("colspan", 2);
                    var $childNodes = $node.nodes || [];
                    var $nodeDiv;

                    if ($childNodes.length > 1) {
                        $nodeCell.attr("colspan", $childNodes.length * 2);
                    }
                    // Draw the node
                    // Get the contents - any markup except li and ul allowed

                    var $nodeContent = "<h3 class='node-title'>" + $node.nodeContent + "</h3><div class='node-tool-bar'>";

                    if($node.editStatus){
                        $nodeContent += "<a class='iconfont node-edit' title='编辑'>&#xf0032;</a>";
                    }

                    if($node.addStatus){
                        $nodeContent += "<a class='iconfont node-add' title='新增'>&#xf00bd;</a>";
                    }

                    if($node.deleteStatus){
                        $nodeContent += "<a class='iconfont node-delete' title='删除'>&#xf00a5;</a>";
                    }

                    if($node.showStatus){
                        $nodeContent += "<a class='iconfont node-show' title='展示'>&#xf00bb;</a>";
                    }

                    $nodeContent += "</div>";
                    var  nodeCount = self.nodeCount;

                    //Increaments the node count which is used to link the source list and the org chart
                    self.nodeCount++;
                    $nodeDiv = $("<div>").addClass("node")
                       .data("tree-node", $node)
                       .append($nodeContent);
                    if ($nodeDiv.cache) $nodeDiv.cache("tree-node", $node);
                    $node.id = nodeCount;    //绑定Id

                    // Expand and contract nodes
                    if ($childNodes.length > 0) {
                        $nodeDiv.on("click", function (evt) {
                            var $this = $(this);
                            if (!self.option.preventDefault) {
                                var $tr = $($this.closest("tr"));
                                if ($node.collapsed === true) {
                                    // Update the <li> appropriately so that if the tree redraws collapsed/non-collapsed nodes
                                    // maintain their appearance
                                    $node.collapsed = false;
                                    //简单判断是否为Ie6||7
                                    isIE6_7 ? self.refresh() : self.refresh($node); //刷新

                                    $this.css('cursor', 'n-resize');
                                    $tr.nextAll("tr").each(function () {
                                        $(this).css('visibility', '');
                                    });
                                } else {
                                    $node.collapsed = true;
                                    isIE6_7 ? self.refresh() : self.refresh($node); //刷新

                                    $this.css('cursor', 's-resize');
                                    $tr.nextAll("tr").each(function () {
                                        $(this).css('visibility', 'hidden');
                                    });
                                }
                            }
                            if ($.isFunction(self.option.onselect)) {
                                self.option.onselect.call($this, evt, $node);
                            }
                        });

                    }
                    $nodeDiv.on("mouseenter",function(evt){
                        var hidden =$(this).data("tree-node").hidden;
                        if(!hidden){
                            $(this).find(".node-tool-bar").show();
                        }
                    });

                    $nodeDiv.on("mouseleave",function(evt){
                        $(this).find(".node-tool-bar").hide();
                    });

                    $nodeCell.append($nodeDiv);
                    $nodeRow.append($nodeCell);
                    $tbody.append($nodeRow);

                    /**
                    * 画线,子节点分支
                    * 递归调用buildNode函数
                    * */
                    if ($childNodes.length > 0) {
                        // if it can be expanded then change the cursor
                        $nodeDiv.css('cursor', 'n-resize');

                        // recurse until leaves found (-1) or to the level specified
                        if (opts.depth == -1 || (level + 1 < opts.depth)) {
                            //不存在parentNode，如根节点。或者，存在且下面有子节点或者没有hasNodes属性
                            //用于判定是否需向下递归
                            var expend = ($node.collapsed !== true);
                            if (expend) {
                                self.drawLine($tbody, $childNodes);
                            }

                            var $childNodesRow = $("<tr/>");
                            $($childNodes).each(function () {
                                var $td = $("<td class='node-container'/>");
                                $td.attr("colspan", 2);
                                // recurse through children lists and items
                                try {
                                    var $child = $(this)[0];
                                    $child.parentNode = $node; //设置父节点
                                    if (expend) {
                                        //创建节点
                                        self.buildNode($(this), $td, level + 1, opts);
                                    }
                                } catch (e) { alert(e); }
                                $childNodesRow.append($td);
                            });
                        }
                        $tbody.append($childNodesRow);
                    }

                    $table.append($tbody);
                    $appendTo.append($table);

                    //将节点的dom元素交给节点对象管理
                    $node.nodeEle = $nodeRow;
                    $node.addNode = $.fn.jOrgChart.util.addNode;
                    $node.remove = $.fn.jOrgChart.util.remove;

                    if ($node.clientFn && $.isFunction($node.clientFn)) {
                        $node.clientFn.call(self, $node);
                    }else{
                        clientFn =function(){

                        }
                        clientFn.call(self,$node);
                        

                    }

                    function clientFn(node){
                        var ele=node.nodeEle,
                            newNode={
                                "nodeContent": "node",
                                "className": "",
                                "nodes": []
                            };
                        $(ele).find(".node-add").on("click",function(e){
                            node.addNode(newNode);
                            e.stopPropagation();
                        });
                        $(ele).find(".node-delete").on("click",function(e){
                            node.remove();
                            e.stopPropagation();
                        });
                        $(ele).find(".node-edit").on("click",function(e){

                            e.stopPropagation();
                        });
                        $(ele).find(".node-show").on("click",function(e){

                            e.stopPropagation();
                        });
                    }

                    
                    /**
                    * 根据设置，选择是否为节点添加样式
                    *
                    * */

                    if ($node.eleStyle) {
                        $nodeDiv[0].style.cssText = $node.eleStyle;
                    }

                    /* Prevent trees collapsing if a link inside a node is clicked */
                    $nodeDiv.children('a').on("click", function (e) {
                        e.stopPropagation();
                    });
                } //end for
            },
            //====刷新指定或者整个树节点
            refresh: function ($node) {
                var self = this, opts = self.option;
                var $appendTo = "body",
                  $container = "body";
                if ($node) {//部分重绘
                    $appendTo = $($node.nodeEle.parent("tbody")),
                      $container = $("<tr/>");
                    $appendTo.children().remove();

                    // self.drawLine($appendTo,$node.nodes||[]);
                    self.buildNode([$node], $container, 0, opts);
                    $appendTo.append($container);
                }
                else {//重绘整个图表
                    self.chart.children().remove();
                    $appendTo = $(opts.chartElement),
                  $container = $("<div class='" + opts.chartClass + "'/>");
                    self.buildNode(opts.nodeData, $container, 0, opts);
                    $appendTo.append($container);
                }
                if (opts.dragAndDrop) {
                //执行拖放回调函数
                // fn.call($this, Util);
                $('div.node').draggable({
                    cursor      : 'move',
                    distance    : 40,
                    helper      : 'clone',
                    opacity     : 0.8,
                    revert      : 'invalid',
                    revertDuration : 100,
                    snap        : 'div.node.expanded',
                    snapMode    : 'inner',
                    stack       : 'div.node'
                });
        
                $('div.node').droppable({
                    accept      : '.node',          
                    activeClass : 'drag-active',
                    hoverClass  : 'drop-hover'
                });
        
                // Drag start event handler for nodes
                $('div.node').on("dragstart", function handleDragStart( event, ui ){
                    var sourceNode = $(this);
                    
                });

                // Drag stop event handler for nodes
                $('div.node').on("dragstop", function handleDragStop( event, ui ){

                });
    
                // Drop event handler for nodes
                $('div.node').on("drop", function handleDropEvent( event, ui ) {   
                     var target = $(this).data("tree-node"),
                         source = ui.draggable.data("tree-node");
                    if(!target.nodes){
                        target.nodes=[];
                    }
                    target.nodes.push(source);
                    source.remove();
                    self.refresh();
                        
                }); // handleDropEvent

            } // Drag and drop
                return self;
            },
            //====添加树节点
            addNode: function (children) {
                var self = this; //此this对象指向$node对象
                if(!self.nodes){
                    self.nodes=[];
                }
                self.nodes.push(children);
                var instance = $.fn.jOrgChart.util._Instance;
                isIE6_7 ? instance.refresh() : instance.refresh(self);
            },
            //====删除树节点
            remove: function () {
                var self = this, id = self.id,
                  parentNode = self.parentNode;

                //删除dataList上的本节点数据
                for (var i = 0, len = parentNode.nodes.length; i < len; i++) {
                    var child = parentNode.nodes[i];
                    if (child && child.id == id) {
                        parentNode.nodes.splice(i, 1);
                        break;
                    }
                }
                var instance = $.fn.jOrgChart.util._Instance;
                isIE6_7 ? instance.refresh() : instance.refresh(self.parentNode || {});
            },
            //===节点中间的连接线
            drawLine: function ($tbody, $childNodes) {
                var $downLineRow = $("<tr/>");
                var $downLineCell = $("<td/>").attr("colspan", $childNodes.length * 2);
                $downLineRow.append($downLineCell);

                //draw the connecting line from the parent node to the horizontal line
                var $downLine = $("<div></div>").addClass("line down");
                $downLineCell.append($downLine);
                $tbody.append($downLineRow);

                // Draw the horizontal lines
                var $linesRow = $("<tr/>");
                $($childNodes).each(function () {
                    var $left = $("<td></td>").addClass("line left top");
                    var $right = $("<td></td>").addClass("line right top");
                    $linesRow.append($left).append($right);
                });
                // horizontal line shouldn't extend beyond the first and last child branches
                $linesRow.find("td:first")
                  .removeClass("top");
                $linesRow.is("tr") ? $linesRow.find("td:last")
                  .removeClass("top") : $($linesRow.parent()).find("td:last")
                  .removeClass("top");
                $linesRow = $linesRow.is("tr") ? $linesRow : $($linesRow.parent());
                $tbody.append($linesRow);
            }
        };
    })(jQuery); 

})