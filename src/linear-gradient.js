import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';
import {rgb} from 'd3-color';
import bigRat from 'big-rational';
import {parseGradientObject} from './linear-gradient-parser';

const HARDSTEPLIMIT = 65535;

var LinearGradient = function (obj, options) {
  this.segments = setWidths(parseGradientObject(_.cloneDeep(obj)));
  options = options || {};
  this.name = options.name || obj.name;
  this.selected = options.selected || obj.selected;
  this.optimize = options.optimize || obj.optimize;
};

LinearGradient.prototype.name = 'Unnamed Linear Gradient';
LinearGradient.prototype.selected = false;
LinearGradient.prototype.optimize = false;

function setWidths(segments) {
  if (segments) {
    return distributeUndeclaredWidths(
      collectDeclaredWidths(segments)
    )}
    else {return false;
  }
}

function collectDeclaredWidths(segments) {
  var sum = 0;
  var count = 0;
  segments.forEach(function (r) {
    if (!isNaN(r.width)) {
      sum += r.width;
      count += 1;
    }
  });
  return {
    segments: segments,
    sum: sum,
    count: count
  };
}

function distributeUndeclaredWidths(o) {
  var segments = o.segments;
  let l = segments.length - o.count;
  let width = (1 - o.sum) / l;
  segments.forEach(function (r, i) {
    if (isNaN(r.width) || r.width === undefined) {
      segments[i].width = width;
    }
  });
  //console.log('distribute',o,segments);
  return segments;
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
  var totalL = 0;
  var sharedDivider = undefined;
  var smallestWidth = steps;
  gradient.segments.forEach(function (segment, i) {
      let s = segment.width * steps;
      let l = segment.gradient.length;
      let fs = s / l;
      gradient.segments[i].steps = s;
      if (l === 2 && segment.gradient[0] === segment.gradient[1]) {
        gradient.segments[i].finesteps = s;
        gradient.segments[i].finewidth = segment.width;
        gradient.segments[i].isFlat = true;
      } else {
        gradient.segments[i].finesteps = fs;
        gradient.segments[i].finewidth = segment.width / segment.gradient.length;
      }
      fs = gradient.segments[i].finesteps;
      if (gradient.optimalBaseStepCount === undefined) {
        let rat = rationalize(bigRat(fs), 1 / (gradient.segments[i].finewidth * HARDSTEPLIMIT));
        let int = fs * rat.denom.value;
        gradient.segments[i].minIntSteps = int;
        totalIntSteps += int;
        if (sharedDivider === undefined) {
          sharedDivider = int;
        }
        else {
          sharedDivider = ggt(sharedDivider, int);
        }
      }
      if (gradient.segments[i].finesteps < 1) {
        rescale = Math.max(rescale, 1 / gradient.segments[i].finesteps);
      }
      sum += s;
      totalSteps += fs;
      totalL += l;
      smallestWidth = Math.min(segment.width/l,smallestWidth);
    }
  );
  gradient.steps = {
    total: totalSteps,
    totalInt: totalIntSteps,
    defined: totalL,
    smallestWidth: smallestWidth,
    optimalBase: totalIntSteps / sharedDivider
  };
/*
  if (gradient.optimalBaseStepCount === undefined && gradient.optimize) {
    gradient = calculateStepSizes(gradient, gradient.optimalBaseStepCount);
  }

  if (smallestWidth * steps < 1 && steps < HARDSTEPLIMIT) {
    console.info(smallestWidth * steps, steps);
    steps = Math.min(steps/smallestWidth, HARDSTEPLIMIT);
    console.info(smallestWidth,'increasing step count to', steps);
    gradient = calculateStepSizes(gradient, steps);
  }
*/

  return gradient;
}

  function collectNormalizedRanges(gradient, steps) {
  gradient = calculateStepSizes(gradient, steps);
  //gradient.normalized = dropNarrowRanges(normalized);
  return gradient;
}

function makeColorScale(range, steps, options) {
  options = options || {};
  var gradient = new LinearGradient(range, options);
  if (!gradient.segments) {return false;}
  gradient = collectNormalizedRanges(gradient, steps);
  if (options.debugGradients) console.log('_____', gradient);


  var segments = gradient.segments;
  var fullSteps;

  //steps = Math.max(gradient.minSteps, steps);
  steps = Math.ceil(steps);
  let stepsAvailable = steps;
  var usedSteps = 0;
  gradient.colorSteps = [];
  var availableRange = 1;

  segments.forEach(function (segment) {
    fullSteps = Math.round(stepsAvailable * segment.width / availableRange);
    availableRange -= segment.width;
    if (fullSteps >= 1 && stepsAvailable >= 1) {
      stepsAvailable -= fullSteps;
      usedSteps += fullSteps;
      gradient.colorSteps = gradient.colorSteps.concat(
        fillColorScale(segment.gradient, fullSteps)
      );
    } else {
      if (options.debugGradients) console.info('dropped range', segment);
    }
  });

  if (usedSteps !== steps) {
    console.error(
      'calculated color steps dont match up', usedSteps, steps, segments);
  }
  return gradient.colorSteps;
}

export {
  makeColorScale
};
