import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';
import {rgb} from 'd3-color';

var LinearGradient = function (obj, options) {
  this.scale = parseGradientObject(obj);
  this.name = options.name || obj.name;
};

function parseGradientObject(obj) {
  // normalize
  if (obj.hasOwnProperty('color')) {
    obj.scale = color;
  }
  if (obj.hasOwnProperty('scale')) {
    if (obj.scale.hasOwnProperty('color')) {
      obj.scale = [color];
    }
    obj.scale.forEach(function (segment, i) {
      if (!segment.hasOwnProperty('width')) {
        obj.scale[i].width = NaN;
      }
      if (segment.hasOwnProperty('color')) {
        // pad single colors to full width
        let color = segment.color;
        if (Array.isArray(color) && color.length === 1) {
          obj.scale[i].color.push(color[0])
        }
        if (typeof color === 'string') {
          obj.scale[i].color = [color,color]
        }
      }
    });
    obj.scale = setWidths(obj.scale);
  }
  return obj;
}


function setWidths(scale) {
  return distributeUndeclaredWidths(
    collectDeclaredWidths(scale)
  );
}

function collectDeclaredWidths(scale) {
  var sum = 0;
  var count = 0;
  scale.forEach(function (r, i) {
    if (!isNaN(r.width)) {
      sum += color.widths[i];
      count += 1;
    }
  });
  return {
    scale:scale,
    sum: sum,
    count: count
  };
}

function distributeUndeclaredWidths(o) {
  var scale = o.scale;
  let l = scale.length - o.count;
  let remainder = 1 - o.sum;
  var lastRemainder, lastUndeclared;
  let width = remainder / l;
  scale.forEach(function (r, i) {
    if (isNaN(r)) {
      lastRemainder = remainder;
      lastUndeclared = scale[i];
      remainder -= width;
      scale[i].width = width;
    }
  });
  return scale;
}
function fillColorScale(range, steps) {
  if (range.length >= 2) {
    let colors = [];
    let stops = [];
    let l = range.length;
    let s = steps - 1;
    for (let i = 0; i < l; i++) {
      stops.push((s) * i / (l - 1));
    }
    let colorScale = scaleLinear()
      .domain(stops)
      .range(range)
      .interpolate(interpolateLab);
    for (let i = 0; i < steps; ++i) {
      colors.push(rgb(colorScale(i)));
    }
    return colors;
  } else {
    return false;
  }
}

function collectStrings(arr) {
  var arrOfArr = [];
  var current = [];
  arr.forEach(function (r) {
    if (Array.isArray(r)) {
      if (current.length > 0) arrOfArr.push(current);
      current = [];
      arrOfArr.push(r);
    } else if (typeof r === 'string') {
      current.push(r);
    }
  });
  if (current.length > 0) arrOfArr.push(current);
  return arrOfArr;
}


function dropNarrowRanges(normalized) {
  var rInput = normalized.range.slice();
  var ranges = [];
  var dropped = [];
  var minimum = 1 / normalized.steps;
  rInput.forEach(function (r, i) {
    if (r[1] < minimum) {
      // redistribute
      if (i === 0) {
        rInput[i + 1][1] += r[1];
      } else if (i === rInput.length - 1) {
        ranges[ranges.length - 1][1] += r[1];
      } else {
        ranges[ranges.length - 1][1] += r[1] / 2;
        rInput[i + 1][1] += r[1] / 2;
      }
      dropped.push(r);
      //normalized.steps -= r[0].length;
    } else {
      ranges.push(r);
    }
  });

  var iterate = 0;
  ranges.forEach(function (r) {
    if (r[1] < minimum) {
      iterate++
    }
  });

  if (dropped.length > 0) {
    console.log('iterate', iterate);
    console.log('dropped', dropped);
  }

  normalized.range = ranges;

  if (iterate > 0) {
    normalized = dropNarrowRanges(normalized);
  }

  return normalized;
}

function collectNormalizedRanges(gradient, steps) {
  var sum = 0;
  var totalSteps = 0;
  var tmp;
  var threshold = 0.00001;
  var equalRanges = true;
  var range = gradient.scale;
  range.forEach(function (a) {
    sum += a[1];
    totalSteps += a[0].length;
    if (equalRanges && tmp !== undefined && Math.abs(a[1] - tmp) > threshold) {
      equalRanges = false;
    }
    tmp = a[1];
  });
  if (sum !== 1) {
    console.warn('sum of range widths does not equal 1', sum, range)
  }

  if (totalSteps > steps && equalRanges) {
    console.warn(steps, 'too few steps requested, increasing to', totalSteps)
    steps = totalSteps;
  }
  var normalized = {
    range: range,
    steps: steps
  };
  gradient.steps = steps;
  gradient.normalized = dropNarrowRanges(normalized);
  return gradient;
}

function makeColorScale(range, steps, options) {
  var gradient = new LinearGradient(range, options);
  //console.log(gradient);

  gradient = collectNormalizedRanges(gradient, steps);
  if (options.selected) console.log(gradient);
  /*
  steps = gradient.normalized.steps;
  range = gradient.normalized.range;
  var fullSteps;
  let stepsAvailable = steps;
  var usedSteps = 0;
  var availableRange = 1;
  var colors = [];
  range.forEach(function (scale) {
    fullSteps = Math.round(stepsAvailable * (scale[1]) / availableRange);
    availableRange -= scale[1];
    if (fullSteps > 1 && stepsAvailable >= 2) {
      stepsAvailable -= fullSteps;
      usedSteps += fullSteps;
      colors = colors.concat(fillColorScale(scale[0], fullSteps));
    } else {
      console.info('dropped range', scale);
    }
  });
  if (usedSteps !== steps) {
    console.error(
      'calculated color steps dont match up', usedSteps, steps, range, colors
    );
  }
  */
  return gradient;
}

export {
  makeColorScale
};
