import ndarray from 'ndarray';
import pack from 'ndarray-pack';
import cwise from 'cwise';
import { extent } from 'd3-array';
import { interpolateLab } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';

const renderToCanvas = cwise({
  args: [
    'index', 'array',
    'scalar', 'scalar', 'scalar', 'scalar', 'scalar'
  ],
  body: function(i, value, imgArray, colors, min, max, imgWidth) {
    let colorIndex = Math.round((value - min) / (max - min) * (colors.length - 1));
    let {r, g, b, a} = colors[colorIndex];
    let base = (i[0] * imgWidth + i[1]) * 4;
    imgArray[base] = r;
    imgArray[++base] = g;
    imgArray[++base] = b;
    imgArray[++base] = a || 255;
  }
});

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
      console.log(range.length, range,l,steps,stops);
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

  function render(_) {
    let canvas = _ || document.createElement('canvas');
    canvas.width = data.shape[1];
    canvas.height = data.shape[0];

    let ctx = canvas.getContext('2d');
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let imgArray = imgData.data;
    let [min, max] = domain || extent(data.data);
    let colors = makeColorScale(colorRange,colorSteps);
    if (colors === false) {
      console.error('specify at least two colors', colorRange);
      colors = makeColorScale(['#000000', '#FFFFFF'],colorSteps);
    }
    console.log(colors.length,colors);
    renderToCanvas(data, imgArray, colors, min, max, canvas.width);
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
