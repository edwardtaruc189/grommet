function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

import React, { forwardRef, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { ThemeContext } from 'styled-components';
import { Box } from '../Box';
import { Chart, calcs } from '../Chart';
import { Grid } from '../Grid';
import { Stack } from '../Stack';
var halfPad = {
  xlarge: 'large',
  large: 'medium',
  medium: 'small',
  small: 'xsmall'
};
var DataChart = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var a11yTitle = _ref.a11yTitle,
      chart = _ref.chart,
      data = _ref.data,
      padProp = _ref.pad,
      size = _ref.size,
      thicknessProp = _ref.thickness,
      xAxis = _ref.xAxis,
      yAxis = _ref.yAxis,
      rest = _objectWithoutPropertiesLoose(_ref, ["a11yTitle", "chart", "data", "pad", "size", "thickness", "xAxis", "yAxis"]);

  console.warn("The DataChart component is still experimental.\n      It is not guaranteed to be backwards compatible until it is explicitly\n      released. Keep an eye on the release notes and #announcements channel\n      in Slack.");
  var theme = useContext(ThemeContext); // refs used for ie11 not having Grid

  var xRef = useRef();
  var spacerRef = useRef(); // normalize chart to an array

  var charts = useMemo(function () {
    return Array.isArray(chart) ? chart : [chart];
  }, [chart]); // map the key values into their own arrays

  var keyValues = useMemo(function () {
    var result = {};
    charts.forEach(function (_ref2) {
      var key = _ref2.key,
          keys = _ref2.keys;

      if (key && !result[key]) {
        result[key] = data.map(function (d) {
          return d[key];
        });
      }

      if (keys) {
        keys.forEach(function (_ref3) {
          var innerKey = _ref3.key;

          if (innerKey && !result[innerKey]) {
            result[innerKey] = data.map(function (d) {
              return d[innerKey];
            });
          }
        });
      }
    });
    return result;
  }, [charts, data]);
  var numValues = useMemo(function () {
    return keyValues[Object.keys(keyValues)[0]].length;
  }, [keyValues]); // setup the values for each chart

  var chartValues = useMemo(function () {
    return charts.map(function (_ref4) {
      var key = _ref4.key,
          keys = _ref4.keys;
      if (key) return keyValues[key];
      var totals = [];
      return keys.map(function (_ref5) {
        var innerKey = _ref5.key;
        return keyValues[innerKey].map(function (v, i) {
          var base = totals[i] || 0;
          totals[i] = base + v;
          return [i, base, base + v];
        });
      });
    });
  }, [charts, keyValues]); // calculate axis, bounds and thickness

  var _useMemo = useMemo(function () {
    var steps = [];
    if (xAxis && xAxis.labels >= 0) steps[0] = xAxis.labels - 1;else steps[0] = numValues - 1; // all

    if (yAxis && yAxis.labels >= 0) steps[1] = yAxis.labels - 1;else steps[1] = 1; // ends

    var tmpAxis;
    var tmpBounds;
    var tmpThickness = thicknessProp;
    charts.forEach(function (_ref6, index) {
      var keys = _ref6.keys;
      (keys ? chartValues[index] : [chartValues[index]]).forEach(function (vals) {
        var _calcs = calcs(vals, {
          steps: steps,
          thickness: tmpThickness
        }),
            a = _calcs.axis,
            b = _calcs.bounds,
            t = _calcs.thickness;

        tmpAxis = a;
        tmpBounds = b;
        tmpThickness = t;
      });
    });
    return {
      axis: tmpAxis,
      bounds: tmpBounds,
      thickness: tmpThickness
    };
  }, [charts, chartValues, numValues, thicknessProp, xAxis, yAxis]),
      axis = _useMemo.axis,
      bounds = _useMemo.bounds,
      thickness = _useMemo.thickness; // set the pad to have the thickness, if not defined


  var pad = useMemo(function () {
    if (padProp !== undefined) return padProp;
    var padSize = halfPad[thickness];
    var allSides = charts.filter(function (_ref7) {
      var type = _ref7.type;
      return type && type !== 'bar';
    }).length > 0;
    if (allSides) return padSize;
    return {
      horizontal: padSize
    };
  }, [charts, padProp, thickness]);
  var xGuide = useMemo(function () {
    return axis[0].map(function (_, i) {
      if (xAxis && xAxis.guide) {
        if (i === 0) return 'left';
        if (i === axis[0].length - 1) return 'right';
      }

      return undefined;
    });
  }, [axis, xAxis]);
  var yGuide = useMemo(function () {
    return axis[1].map(function (_, i) {
      if (yAxis && yAxis.guide) {
        if (i === 0) return 'top';
        if (i === axis[1].length - 1) return 'bottom';
      }

      return undefined;
    });
  }, [axis, yAxis]); // for ie11, align the spacer Box height to the x-axis height

  useLayoutEffect(function () {
    if (xRef.current && spacerRef.current) {
      var rect = xRef.current.getBoundingClientRect();
      spacerRef.current.style.height = rect.height + "px";
    }
  }, []);
  /* eslint-disable react/no-array-index-key */

  var xAxisElement;

  if (xAxis) {
    // Set basis to match thickness. This works well for bar charts,
    // to align each bar's label.
    var basis;

    if (thickness && axis[0].length === numValues) {
      basis = theme.global.edgeSize[thickness] || thickness;
    }

    xAxisElement = /*#__PURE__*/React.createElement(Box, {
      ref: xRef,
      gridArea: "xAxis",
      direction: "row",
      justify: "between"
    }, axis[0].map(function (a, i) {
      var content;
      if (xAxis.render) content = xAxis.render(a, i);else if (xAxis.key) content = data[i][xAxis.key];else content = a;
      return /*#__PURE__*/React.createElement(Box, {
        key: i,
        basis: basis,
        align: basis ? 'center' : undefined
      }, content);
    }));
  }

  var yAxisElement;

  if (yAxis) {
    yAxisElement = /*#__PURE__*/React.createElement(Box, {
      gridArea: "yAxis",
      justify: "between",
      flex: true
    }, axis[1].map(function (a, i) {
      var content;
      if (yAxis.render) content = yAxis.render(a, i);else content = a;
      return /*#__PURE__*/React.createElement(Box, {
        key: i,
        align: "end"
      }, content);
    }));
  }

  var stackFill = useMemo(function () {
    if (size === 'fill' || size && size.width === 'fill' && size.height === 'fill') return true;
    if (size && size.width === 'fill') return 'horizontal';
    if (size && size.height === 'fill') return 'vertical';
    return undefined;
  }, [size]);
  var stackElement = /*#__PURE__*/React.createElement(Stack, {
    gridArea: "charts",
    guidingChild: "last",
    fill: stackFill
  }, xAxis && xAxis.guide && /*#__PURE__*/React.createElement(Box, {
    fill: true,
    direction: "row",
    justify: "between",
    pad: pad
  }, xGuide.map(function (_, i) {
    return /*#__PURE__*/React.createElement(Box, {
      key: i,
      border: "left"
    });
  })), yAxis && yAxis.guide && /*#__PURE__*/React.createElement(Box, {
    fill: true,
    justify: "between",
    pad: pad
  }, yGuide.map(function (_, i) {
    return /*#__PURE__*/React.createElement(Box, {
      key: i,
      border: "top"
    });
  })), charts.map(function (_ref8, i) {
    var key = _ref8.key,
        keys = _ref8.keys,
        chartRest = _objectWithoutPropertiesLoose(_ref8, ["key", "keys"]);

    if (keys) {
      // reverse to ensure area Charts are stacked in the right order
      return keys.map(function (_, j) {
        return /*#__PURE__*/React.createElement(Chart, _extends({
          key: j,
          values: chartValues[i][j],
          color: keys[j].color,
          bounds: bounds,
          overflow: true,
          pad: pad,
          size: size,
          thickness: thickness
        }, chartRest));
      }).reverse();
    }

    return /*#__PURE__*/React.createElement(Chart, _extends({
      key: i,
      values: chartValues[i],
      bounds: bounds,
      overflow: true,
      pad: pad,
      size: size,
      thickness: thickness
    }, chartRest));
  })); // IE11

  if (!Grid.available) {
    var content = stackElement;

    if (xAxisElement) {
      content = /*#__PURE__*/React.createElement(Box, null, content, xAxisElement);
    }

    if (yAxisElement) {
      content = /*#__PURE__*/React.createElement(Box, {
        direction: "row"
      }, /*#__PURE__*/React.createElement(Box, null, yAxisElement, /*#__PURE__*/React.createElement(Box, {
        ref: spacerRef,
        flex: false
      })), content);
    }

    return content;
  }

  return /*#__PURE__*/React.createElement(Grid, _extends({
    ref: ref,
    "aria-label": a11yTitle,
    fill: stackFill,
    columns: ['auto', stackFill === true || stackFill === 'horizontal' ? 'flex' : 'auto'],
    rows: [stackFill === true || stackFill === 'vertical' ? 'flex' : 'auto', 'auto'],
    areas: [{
      name: 'yAxis',
      start: [0, 0],
      end: [0, 0]
    }, {
      name: 'xAxis',
      start: [1, 1],
      end: [1, 1]
    }, {
      name: 'charts',
      start: [1, 0],
      end: [1, 0]
    }]
  }, rest), xAxisElement, yAxisElement, stackElement);
});
DataChart.displayName = 'DataChart';
var DataChartDoc;

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  DataChartDoc = require('./doc').doc(DataChart);
}

var DataChartWrapper = DataChartDoc || DataChart;
export { DataChartWrapper as DataChart };