import ndarray from 'ndarray';
import pack from 'ndarray-pack';
import {extent} from 'd3-array';
import colorbrewer from 'colorbrewer';
import {makeColorScale} from './linear-gradient';
import {interpolateLab} from 'd3-interpolate';
import {scaleLinear} from 'd3-scale';
import {rgb} from 'd3-color';

function renderToCanvas(ndArr, imgArray, colorTable, min, max) {
  // premultiply constant values
  let range = max - min; // add one for padding to equal spaced
  let w = ndArr.shape[1];
  let h = ndArr.shape[0];
  let l = colorTable.length;
  let lineStartIndex = 0;
  let index = 0;
  let lastIndex = w * h;

  function forIndex(index) {
    let norm = ndArr.data[index] - min;
    let colorIndex = Math.floor((norm / range) * l);
    imgArray[index] = colorTable[colorIndex];
  }

  function forLine(index, lineEndIndex) {
    while (index < lineEndIndex) {
      forIndex(index);
      index++;
    }
  }

  while (lineStartIndex < lastIndex) {
    index = lineStartIndex;
    forLine(index, lineStartIndex + w);
    lineStartIndex += w;
  }
}

const fallBackColorScale = colorbrewer.YlGnBu[5];

function heatmap() {
  let data = ndarray(new Float64Array([0]), [1, 1]);
  let colorSteps = 256;
  let domain = null;
  let colorRange = fallBackColorScale;
  var options = undefined;


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

  function timeFn(runTimer, fn, logFn, data) {

    if (runTimer) {
      let p = performance.now();
      fn();
      let time = performance.now() - p;
      logFn(time, data);
    }
    else fn();
  }


  function render(_) {
    let canvas = _ || document.createElement('canvas');
    canvas.width = data.shape[1];
    canvas.height = data.shape[0];
    let ctx = canvas.getContext('2d');
    options = options || {};
    let debug = options.debug || false;

    let imgData = ctx.createImageData(canvas.width, canvas.height);

    let pixels = canvas.width * canvas.height;

    let buf = new ArrayBuffer(pixels * 4);
    let buf8 = new Uint8ClampedArray(buf);
    let buf32 = new Uint32Array(buf);

    let [min, max] = domain || extent(data.data);
    var colors;

    if (typeof makeColorScale === 'function') {
      colors = makeColorScale(colorRange, colorSteps, options.gradient);
      if (options.gradient.debug > 1) console.log(colors);
    } else {
      colors = fillColorScale(colorRange, colorSteps);
    }

    if (!colors) {
      return false;
    }
    let colorTable = buildColorTable(colors);
    timeFn(
      debug > 0,
      function () {
        renderToCanvas(data, buf32, colorTable, min, max)
      },
      function (time, data) {
        console.log('LUT Perf:', time.toPrecision(5), 'ms/MPixel', (time * 1000000 / (data.shape[0] * data.shape[1])).toPrecision(5));
      },
      data
    );

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

  render.options = function (_) {
    return arguments.length ? (options = _, render) : options;
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
  heatmap
};
