window.addEventListener('load', function () {
    var debugHeatMap, debugGradients;
  //var debugGradients = 0; // 1,2
  //var debugHeatMap = 1; // 1,2
    var base = 512;
    var half = Math.floor(base / 2);
    var shape = [base, half];
    var data = new Array(shape[0]);
    var domain = [0, half];

    function centerDistance(a, b) {
      return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }

    function invert(v, offset) {
      return -(v + offset);
    }

    for (var i = 0; i < shape[0]; ++i) {
      data[i] = new Array(shape[1]);
      var y = i - half;
      for (var j = 0; j < shape[1]; ++j) {
        let x = j - half;
        if (y <= 0) {
          data[i][j] = centerDistance(x, y);
        } else {
          x = j;
          data[i][j] = invert(centerDistance(x, y), -half);
          //if (y == 170 && x > half -16) console.log(x, y, i, j, data[i][j]);
        }
      }
    }

    if (typeof convert === 'function') data = convert(data);

    var steps = [1, 2, 5, 9, 15, 64, 256, 1024];
    var selectedSteps = [16];
    var smallSizeFactor = 0.25;
    var selectedScales = ['bw'];
    var selectedScalesObj = {};
    var options = {gradient: {}};
    var allSmall = true;
    //var allSmall = false;
    var optimizeAll = false;



    // be careful with multi-hue scales
    // use only predefined stops from color brewer
    // https://vis4.net/blog/posts/mastering-multi-hued-color-scales/

    function renderScale(colorScale, steps, options) {
      return new Promise(function (resolve, reject) {
        var canvas = document.createElement('canvas');
        var name = options.gradient.name;
        canvas.setAttribute('class', 'gradient-' + name + "-" + steps);
        canvas.width = shape[1];
        canvas.height = shape[0];
        if (options.canvasStyleSize) {
          canvas.style.width = options.canvasStyleSize.width;
          canvas.style.height = options.canvasStyleSize.height;
        }
        document.body.appendChild(canvas);
        setTimeout(function () {
          var ctx;
          //console.log(name);
          options.gradient.name = name;
          let renderer = heatmap.heatmap()
            .data(data)
            .domain(domain)
            .colorSteps(steps)
            .options(options)
            .colorRange(colorScale);
          let result = renderer(canvas);
          if (!result) {
            ctx = canvas.getContext('2d');
            let text = "Error!";
            ctx.textAlign = "center";
            let height = canvas.width / text.length * (5 / 3);
            ctx.font = height + "px monospace";
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
          } else {
            ctx = result.getContext('2d');
          }
          ctx.globalCompositeOperation = 'xor';
          ctx.font = 45 + "px monospace";
          ctx.textAlign = "left";
          ctx.fillText(steps + " Steps", 15, 45);
          ctx.fillText(name, 15, 90);
          resolve(result);
        }, 200);
      });
    }

    function forEachStep(scale, steps, options) {
      steps.forEach(function (step) {
        renderScale(scale, step, options);
      })
    }

    function forEachScale(scales, steps, options) {
      for (var key in scales) {
        options.gradient.name = scales[key].name || key;
        forEachStep(scales[key], steps, options, key);
      }
    }

    options.gradient.debug = debugGradients;
    options.debug = debugHeatMap || false;


    if (selectedScales === undefined || !selectedScales || selectedScales === "")
      selectedScalesObj = {};
    if (typeof selectedScales === 'string')
      selectedScalesObj[selectedScales] = testScales[selectedScales];
    if (Array.isArray(selectedScales))
      selectedScales.forEach(function (n) {
        if (testScales[n]) {
          selectedScalesObj[n] = testScales[n];
        }
      });

    options.gradient.selected = true;
    forEachScale(selectedScalesObj, selectedSteps, options);

    if (allSmall) {
      options.gradient.selected = false;
      if (optimizeAll) options.gradient.optimize = true;
      options.canvasStyleSize = {
        height: smallSizeFactor * shape[0] + 'px',
        width: smallSizeFactor * shape[1] + 'px'
      };
      forEachScale(testScales, steps, options);
    }
  }
);
