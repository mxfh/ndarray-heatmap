import ndarray from 'ndarray';
import pack from 'ndarray-pack';
import {extent} from 'd3-array';
import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';
import {rgb} from 'd3-color';
import colorbrewer from 'colorbrewer';

function renderToCanvas(ndArr, imgArray, colorTable, l, min, range, imgWidth) {
  for (let y = 0; y < ndArr.shape[0]; ++y) {
    let yIndex = imgWidth * y;
    for (let x = 0; x < ndArr.shape[1]; ++x) {
      let norm = ndArr.data[yIndex + x] - min;
      let colorIndex = ~~((norm / range) * l);
      imgArray[yIndex + x] = colorTable[colorIndex];
    }
  }
}

const fallBackColorScale = colorbrewer.YlGnBu[5];

function heatmap() {
  let data = ndarray(new Float64Array([0]), [1, 1]);
  let colorSteps = 256;
  let domain = null;
  let colorRange = fallBackColorScale;

  // =============================================
  // colorscale handling to be moved to own module
  // =============================================

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
        if (current.length >= 2) {
          arrOfArr.push(current);
          current = [];
        }
        arrOfArr.push(r);
      } else if (typeof r === 'string') {
        current.push(r);
      }
    });
    if (current.length >= 2) {
      arrOfArr.push(current);
    }
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
    //console.log(arr,reserved);
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
        normalized.steps -= r[0].length;
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

    if(iterate > 0) {
      normalized = dropNarrowRanges(normalized);
    }

    return normalized;
  }

  function collectNormalizedRanges(range, steps) {
    var reservedWidth;
    var sum = 0;
    var totalSteps = 0;
    var tmp;
    var threshold = 0.00001;
    var equalRanges = true;
    range = collectStrings(range);
    reservedWidth = collectDeclaredWidths(range);
    range = distributeUndeclaredWidths(range, reservedWidth);
    range.forEach(function (a) {
      sum += a[1];
      totalSteps += a[0].length;
      if (equalRanges && tmp !== undefined && Math.abs(a[1]-tmp) > threshold) {
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
    normalized = dropNarrowRanges(normalized);
    return normalized;
  }

  function makeColorScale(range, steps) {
    var normalized = collectNormalizedRanges(range, steps);
    steps = normalized.steps;
    range = normalized.range;
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


  // =======================
  // end colorscale handling
  // =======================


  function buildColorTable(colors) {
    var typedArr = new Uint32Array(colors.length);
    colors.forEach(function (c, i) {
      let {r, g, b, opacity} = c;
      let a = (opacity === undefined ? 1 : opacity) * 255;
      typedArr[i] = // concatenate to 32Bit (4*8bit) color value
        (a << 24) |
        (b << 16) |
        (g << 8) |
        r;
    });
    return typedArr;
  }

  function render(_) {
    let canvas = _ || document.createElement('canvas');
    canvas.width = data.shape[1];
    canvas.height = data.shape[0];
    let ctx = canvas.getContext('2d');

    let imgData = ctx.createImageData(canvas.width, canvas.height);

    let pixels = canvas.width * canvas.height;

    let buf = new ArrayBuffer(pixels * 4);
    let buf8 = new Uint8ClampedArray(buf);
    let buf32 = new Uint32Array(buf);

    let [min, max] = domain || extent(data.data);

    let colors = makeColorScale(colorRange, colorSteps);
    //console.log(colorRange, colors.length, colors);
    if (colors === false) {
      console.error('specify at least two colors', colorRange);
      colors = makeColorScale(fallBackColorScale, colorSteps);
    }

    let colorTable = buildColorTable(colors);

    // premultiply constant values
    let range = max - min + 1; // add one for padding to equal spaced
    let l = colors.length;

    renderToCanvas(data, buf32, colorTable, l, min, range, canvas.width);

    imgData.data.set(buf8);
    ctx.putImageData(imgData, 0, 0);

    return canvas;
  }

  render.data = function (_) {
    if (!arguments.length) return data;

    // Convert plain JS array into ndarray
    _ = _.shape ? _ : pack(_);

    if (_.shape.length !== 2) throw new Error(`Invalid rank: ${_.shape.length}`);
    data = _;
    return render;
  }

  render.colorSteps = function (_) {
    return arguments.length ? (colorSteps = _, render) : colorSteps;
  }

  render.domain = function (_) {
    return arguments.length ? (domain = _, render) : domain;
  }

  render.colorRange = function (_) {
    return arguments.length ? (colorRange = _, render) : colorRange;
  }

  return render;
}

export {
  heatmap, colorbrewer
};
