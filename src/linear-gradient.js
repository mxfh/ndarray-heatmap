import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';
import {rgb} from 'd3-color';
import bigRat from 'big-rational';

const HARDSTEPLIMIT = 65535;

var LinearGradient = function (obj, options) {
  this.colors = parseGradientObject(obj);
  this.name = options.name || obj.name;
  this.selected = (options.selected || obj.selected) || false;
  this.optimize = (options.optimize || obj.optimize) || false;
};

function parseGradientObject(obj) {
  // normalize
  if (Array.isArray(obj)) {
    var colors = obj.slice();
    var collecting = [];
    obj = {
      colors: [],
      width: NaN
    };
    // collect strings and arrays as arrays;
    colors.forEach(function (m) {
        if (typeof m === 'string') {
          collecting.push(m);
        } else if (Array.isArray(m)) {
          if (collecting.length > 0) obj.colors.push(
            {color: collecting}
          );
          collecting = [];
          let last = m.slice().pop();
          if(typeof last === 'number') {
            let w = m.pop();
            obj.colors.push({
              color: m,
              width : w
            });
          } else {
            obj.colors.push({color: m});
          }
        }
      }
    );
    if (collecting.length > 0) obj.colors.push(
      {color: collecting}
    );
  }

  if (obj.hasOwnProperty('color')) {
    obj.colors = [{
      color: obj.color,
      width: obj.width || NaN
    }];
    delete obj.color;
  }
  if (obj.hasOwnProperty('colors')) {
    if (obj.colors.hasOwnProperty('color')) {
      obj.colors = [obj.colors];
    }
    obj.colors.forEach(function (colorObj, i) {
      if (!colorObj.hasOwnProperty('width')) {
        obj.colors[i].width = NaN;
      }
      if (colorObj.hasOwnProperty('color')) {
        // pad single colors to full width
        let color = colorObj.color;
        if (
          Array.isArray(color) &&
          color.length === 1 &&
          typeof color[0] === 'string') {
          obj.colors[i].color.push(color[0])
        }
        if (typeof color === 'string') {
          obj.colors[i].color = [color, color]
        }
      }
    });
    obj.colors = setWidths(obj.colors);
  }
  return obj.colors;
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
      sum += r.width;
      count += 1;
    }
  });
  return {
    scale: scale,
    sum: sum,
    count: count
  };
}

function distributeUndeclaredWidths(o) {
  var scale = o.scale;
  let l = scale.length - o.count;
  let width = (1 - o.sum) / l;
  scale.forEach(function (r, i) {
    if (isNaN(r.width)) {
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

function ggt(m, n) {
  if (n == 0)
    return m;
  else
    return ggt(n, m % n);
}

function kgv(m, n) {
  o = ggt(m, n);
  p = (m * n) / o;
  return p;
}

function rationalize(rational, epsilon) {
  var denominator = 0;
  var numerator;
  var error;

  do {
    denominator++;
    numerator = Math.round((rational.numerator * denominator) / rational.denominator);
    error = Math.abs(rational.minus(numerator / denominator));
  } while (error > epsilon);
  return bigRat(numerator, denominator);
}

function calculateStepSizes(gradient, steps) {
  steps = Math.min(steps, HARDSTEPLIMIT);
  var sum = 0;
  var totalSteps = 0;
  var totalIntSteps = 0;
  var rescale = 1;
  var sharedDivider = undefined;
  gradient.colors.forEach(function (colorObj, i) {
      let s = colorObj.width * steps;
      let l = colorObj.color.length;
      let fs = s / l;
      gradient.colors[i].steps = s;
      if (l === 2 && colorObj.color[0] === colorObj.color[1]) {
        gradient.colors[i].finesteps = s;
        gradient.colors[i].finewidth = colorObj.width;
        gradient.colors[i].isFlat = true;
      } else {
        gradient.colors[i].finesteps = fs;
        gradient.colors[i].finewidth = colorObj.width / colorObj.color.length;
      }
      fs = gradient.colors[i].finesteps;
      if (gradient.optimalBaseStepCount === undefined && gradient.optimize) {
        let rat = rationalize(bigRat(fs), 1 / (gradient.colors[i].finewidth * HARDSTEPLIMIT));
        let int = fs * rat.denom.value;
        gradient.colors[i].minIntSteps = int;
        totalIntSteps += int;
        if (sharedDivider === undefined) {
          sharedDivider = int;
        }
        else {
          sharedDivider = ggt(sharedDivider, int);
        }
      }
      if (gradient.colors[i].finesteps < 1) {
        rescale = Math.max(rescale, 1 / gradient.colors[i].finesteps);
      }
      sum += s;
      totalSteps += fs;
    }
  );
  if (gradient.optimalBaseStepCount === undefined && gradient.optimize) {
    gradient.optimalBaseStepCount = totalIntSteps / sharedDivider;
    gradient = calculateStepSizes(gradient, gradient.optimalBaseStepCount);
  }

  if (rescale > 1 && steps < HARDSTEPLIMIT) {
    steps = Math.min(rescale * steps, HARDSTEPLIMIT);
    console.info('increasing step count to', steps);
    gradient = calculateStepSizes(gradient, steps);
  }
  return gradient;
}

function collectNormalizedRanges(gradient, steps) {
  gradient = calculateStepSizes(gradient, steps);
  //gradient.normalized = dropNarrowRanges(normalized);
  return gradient;
}

function makeColorScale(range, steps, options) {
  var gradient = new LinearGradient(range, options);
  gradient = collectNormalizedRanges(gradient, steps);
  if (gradient.selected) console.log(gradient);
  var colors = gradient.colors;
  var fullSteps;
  steps = gradient.optimalBaseStepCount || steps;
  let stepsAvailable = steps;
  var usedSteps = 0;
  gradient.colorSteps = [];
  var availableRange = 1;
  colors.forEach(function (colorObj) {
    fullSteps = Math.round(stepsAvailable * colorObj.width / availableRange);
    availableRange -= colorObj.width;
    if (fullSteps >= 1 && stepsAvailable >= 1) {
      stepsAvailable -= fullSteps;
      usedSteps += fullSteps;
      gradient.colorSteps = gradient.colorSteps.concat(
        fillColorScale(colorObj.color, fullSteps)
      );
    } else {
      console.info('dropped range', colorObj);
    }
  });
  if (usedSteps !== steps) {
    console.error(
      'calculated color steps dont match up', usedSteps, steps, colors);
  }
  return gradient.colorSteps;
}

export {
  makeColorScale
};
