import ndarray from 'ndarray';
import pack from 'ndarray-pack';
import cwise from 'cwise';
import { extent } from 'd3-array';
import { interpolateLab } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';

function renderToCanvas(ndArr, imgArray, colorTable, l, min, range, imgWidth) {
    for(let y = 0; y<ndArr.shape[0]; ++y) {
      let yIndex = imgWidth * y;
    for(let x = 0; x<ndArr.shape[1]; ++x) {
      let norm = ndArr.data[yIndex+x] - min;
      let colorIndex = ~~((norm / range) * l);
      imgArray[yIndex + x] = colorTable[colorIndex];
    }
  }
}

function heatmap() {
  let data = ndarray(new Float64Array([0]), [1, 1]);
  let colorSteps = 256;
  let domain = null;
  let colorRange = ['#000000', '#FFFFFF'];

  function makeColorScale(range,steps) {
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

  function buildColorTable(colors) {
    var typedArr = new Uint32Array(colors.length);
    colors.forEach(function(c,i) {
      let {r, g, b, opacity} = c;
      let a = (opacity === undefined ? 1 : opacity) * 255;
      let byteValue32 =
        (a << 24) |
        (b << 16) |
        (g << 8) |
        r ;
      typedArr[i]= byteValue32;
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

    let colors = makeColorScale(colorRange,colorSteps);

    if (colors === false) {
      console.error('specify at least two colors', colorRange);
      colors = makeColorScale(['#000000', '#FFFFFF'],colorSteps);
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

  render.data = function(_) {
    if(!arguments.length) return data;

    // Convert plain JS array into ndarray
    _ = _.shape ? _ : pack(_);

    if(_.shape.length !== 2) throw new Error(`Invalid rank: ${_.shape.length}`);
    data = _;
    return render;
  }

  render.colorSteps = function(_) {
    return arguments.length ? (colorSteps = _, render) : colorSteps;
  }

  render.domain = function(_) {
    return arguments.length ? (domain = _, render) : domain;
  }

  render.colorRange = function(_) {
    return arguments.length ? (colorRange = _, render) : colorRange;
  }

  return render;
}

export {
  heatmap
};
