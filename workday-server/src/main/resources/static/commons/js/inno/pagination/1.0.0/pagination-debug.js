define('inno/pagination/0.0.1/pagination-debug', [ '$', 'widget', 'base', 'class', 'events',
    'gallery/react/0.13.2/react' ], function(require, exports, module) {
  var $ = require('$'), Widget = require('widget');

  var React = require('gallery/react/0.13.2/react');

  var UIPagination = React.createClass({
    displayName: "UIPagination",

    render: function() {
      var pageNumber = this.props.pageNumber, pageIndex = this.props.pageIndex;

      var list = [];

      var bi = Math.max(1, pageIndex - 2);
      var ei = Math.min(bi + 4, pageNumber);
      bi = Math.max(1, Math.min(bi, ei - 4));
      for (var i = bi; i <= ei; i++) {
        list.push('<a className="pagination-item ' + (i === pageIndex ? ' active "' : '"') + ' data-page=' + i
            + ' data-role="item">' + i + '</a>');
      }
      return React.createElement("div", null, React.createElement("a", {
        className: "ui-pagination-first",
        "data-role": "first"
      }, "首页"), React.createElement("a", {
        className: "ui-pagination-prev",
        "data-role": "prev"
      }, "上一页"), React.createElement("a", {
        className: "ui-pagination-next",
        "data-role": "next"
      }, "下一页"), React.createElement("a", {
        className: "ui-pagination-last",
        "data-role": "last"
      }, "尾页"), React.createElement("span", {
        className: "ui-pagination-total"
      }, "页数:", pageNumber))
    }
  });

  var Pagination = Widget.extend({
    attrs: {
      element: {
        value: [],
        getter: function(val) {
          return $(val);
        }
      },
      pageNumber: 0,
      pageIndex: 0
    },
    setup: function() {
      this._draw();
      Pagination.superclass.setup.call(this);
    },
    _draw: function() {
      var pageIndex = this.get('pageIndex'), pageNumber = this.get('pageNumber');

      React.render(React.createElement(UIPagination, {
        pageIndex: pageIndex,
        pageNumber: pageNumber
      }), m);

    }

  });

  module.exports = Pagination;
});