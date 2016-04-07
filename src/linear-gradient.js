import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';
import {rgb} from 'd3-color';

var LinearGradient = function (range, options) {
  if (typeof range == 'object' && range.hasOwnProperty('colorRange')) {
    for (var prop in range) {
      if (range.hasOwnProperty(prop)) {
        this[prop] = range[prop];
      }
    }
  } else {
    this.colorRange = range;
  }
  // patse options from obkect in array
  var last = range[range.length -1];
  if (range.length > 1 && typeof last == 'object' && !Array.isArray(last)) {
    for (var prop in last) {
      if (last.hasOwnProperty(prop)) {
        if(this[prop] !== undefined) console.info('overiding options',this[prop], last[prop]);
        this[prop] = last[prop];
      }
    }
  }

  for (var prop in options) {
    if (options.hasOwnProperty(prop)) {
      if(this[prop] !== undefined) console.info('overiding options',this[prop], options[prop]);
      this[prop] = options[prop];
    }
  }
  this.colorRange = parseRange(this.colorRange, this);
};
LinearGradient.prototype.style = 'continuous';

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

function collectDeclaredWidths(arr) {
  let width = 0;
  let count = 0;
  arr.forEach(function (r) {
    if (
      Array.isArray(r[0]) &&
      typeof r[1] === 'number' &&
      r[1] > 0 &&
      r[1] <= 1
    ) {
      width += r[1];
      count += 1;
    }
  });
  return {
    width: width,
    count: count
  };
}

function distributeUndeclaredWidths(arr, reserved) {
  let l = arr.length - reserved.count;
  let remainder = 1 - reserved.width;
  var lastRemainder, lastUndeclared;
  let width = remainder / l;

  arr.forEach(function (r, i) {
    if (!(
        Array.isArray(r[0]) && typeof r[1] === 'number' &&
        r[1] > 0 &&
        r[1] <= 1
      )) {
      lastRemainder = remainder;
      lastUndeclared = arr[i];
      remainder -= width;
      arr[i] = [r, width];
    }
  });
  if (remainder !== 0) {
    lastUndeclared = lastRemainder;
  }
  return arr;
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

function padOutSingleMemberArrays(range) {
  range.forEach(function (current,i) {
    if (Array.isArray(current) && current.length === 1 && typeof current[0] === 'string') {
      range[i].push(current[0]);
    }
  });
  return range;
}

function flattenExplicit(r) {
    r.forEach(function (e, i) {
    r[i] = [e,e];
  });
  return r;
}

function parseRange(range, options) {
  if (typeof range == 'string') range = [range];
  range = collectStrings(range);
  if (options.style === 'flat' && Array.isArray(range)) {
    range = flattenExplicit(range[0]);
  }
  range = padOutSingleMemberArrays(range);
  console.log(range);
  let reservedWidth = collectDeclaredWidths(range);
  return distributeUndeclaredWidths(range, reservedWidth);
}

function collectNormalizedRanges(gradient, steps) {
  var sum = 0;
  var totalSteps = 0;
  var tmp;
  var threshold = 0.00001;
  var equalRanges = true;
  var range = gradient.colorRange;
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
  gradient = collectNormalizedRanges(gradient, steps);
  console.log(gradient);
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
  return colors;
}

export {
  makeColorScale
};
