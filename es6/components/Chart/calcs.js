import { normalizeValues } from './utils';
var thicknessPad = {
  xlarge: 'large',
  large: 'medium',
  medium: 'small',
  small: 'xsmall',
  xsmall: 'xxsmall'
};
export var calcs = function calcs(values, options) {
  if (options === void 0) {
    options = {};
  }

  // coarseness influences the rounding of the bounds, the smaller the
  // number, the more the bounds will be rounded. e.g. 111 -> 110 -> 100
  var coarseness = options.coarseness || 5; // the number of steps is one less than the number of labels

  var steps = options.steps || [1, 1];
  var calcValues = normalizeValues(values || []);
  var min;
  var max;

  if (calcValues.length) {
    // Calculate the max and min y values.
    calcValues.forEach(function (value) {
      var y = value.value[1];
      min = min === undefined ? y : Math.min(min, y);
      max = max === undefined ? y : Math.max(max, y); // handle ranges of values

      var y2 = value.value[2];

      if (y2 !== undefined) {
        min = Math.min(min, y2);
        max = Math.max(max, y2);
      }
    }); // Calculate some reasonable y bounds based on the max and min y values.
    // This is so values like 87342.12 don't end up being displayed as the
    // graph axis edge label.

    var delta = max - min;
    var interval = Number.parseFloat((delta / coarseness).toPrecision(1));
    max = max - max % interval + interval;
    min -= min % interval;

    if (min < 0 && max > 0 && Math.abs(min) !== Math.abs(max)) {
      // Adjust min and max when crossing 0 to ensure 0 will be shown on
      // the Y axis based on the number of steps.
      // const ratio = Math.abs(max) / Math.abs(min);
      var stepInterval = (max - min) / steps[1];
      var minSteps = min / stepInterval;
      var maxSteps = max / stepInterval;

      if (Math.abs(minSteps) < Math.abs(maxSteps)) {
        stepInterval = max / Math.floor(maxSteps);
        max = stepInterval * Math.floor(maxSteps);
        min = stepInterval * Math.floor(minSteps);
      } else {
        stepInterval = Math.abs(min / Math.ceil(minSteps));
        min = stepInterval * Math.ceil(minSteps);
        max = stepInterval * Math.ceil(maxSteps);
      }
    }
  }

  if (options.min !== undefined) {
    var _options = options;
    min = _options.min;
  }

  if (options.max !== undefined) {
    var _options2 = options;
    max = _options2.max;
  }

  var bounds = calcValues.length ? [[calcValues[0].value[0], calcValues[calcValues.length - 1].value[0]], [min, max]] : [[], []];
  var dimensions = [bounds[0][1] - bounds[0][0], bounds[1][1] - bounds[1][0]]; // Calculate x and y axis values across the specfied number of steps.

  var yAxis = [];
  var y = bounds[1][1];
  var yStepInterval = dimensions[1] / steps[1];

  while (y >= bounds[1][0]) {
    yAxis.push(y);
    y -= yStepInterval;
  }

  var xAxis = [];
  var x = bounds[0][0];
  var xStepInterval = dimensions[0] / steps[0];

  while (xStepInterval > 0 && x <= bounds[0][1] || xStepInterval < 0 && x >= bounds[0][1]) {
    xAxis.push(x);
    x += xStepInterval;
  }

  var _options3 = options,
      thickness = _options3.thickness;

  if (!thickness) {
    // Set bar thickness based on number of values being rendered.
    // Someday, it would be better to include the actual rendered size.
    // These values were emirically determined, trying to balance visibility
    // and overlap across resolutions.
    if (calcValues.length < 5) {
      thickness = 'xlarge';
    } else if (calcValues.length < 11) {
      thickness = 'large';
    } else if (calcValues.length < 21) {
      thickness = 'medium';
    } else if (calcValues.length < 61) {
      thickness = 'small';
    } else if (calcValues.length < 121) {
      thickness = 'xsmall';
    } else {
      thickness = 'hair';
    }
  }

  var pad = thicknessPad[thickness];
  return {
    axis: [xAxis, yAxis],
    bounds: bounds,
    dimensions: dimensions,
    pad: pad,
    thickness: thickness
  };
};