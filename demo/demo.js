window.addEventListener('load', function () {
  var shape = [512, 512];
  var data = new Array(shape[0]);
  for (var i = 0; i < shape[0]; ++i) {
    data[i] = new Array(shape[1]);
    for (var j = 0; j < shape[1]; ++j) {
      data[i][j] = j * Math.sin(i * Math.PI / 2 / shape[0]);
    }
  }
  var steps = [1,2,3,5,9,15,25,64,128];
  //steps = 12;
  var smallSizeFactor = 0.25;


  // be careful with multi-hue scales
  // use only predefined stops from color brewer
  // https://vis4.net/blog/posts/mastering-multi-hued-color-scales/

  var selectedScale = [' '];
  var allSmall = true;
  var debugGradients = false;
  //testScales = testScaleShort;


  function renderScale(colorScale, options, canvasSize) {
    if (Array.isArray(steps)) {
      steps.forEach(function (step) {
        renderStep(colorScale, options, canvasSize, step)
      })
    } else {
      renderStep(colorScale, options, canvasSize, steps)
    }
  }

  function renderStep(colorScale, options, canvasSize, step) {
    options.debugGradients = options.debugGradients || debugGradients;
    var renderer = heatmap.heatmap()
      .data(data)
      .colorSteps(step)
      .options(options)
      .colorRange(colorScale);
    var canvas = renderer();
    if (!canvas) return false;
    if (canvasSize) {
      canvas.style.width = canvasSize.width;
      canvas.style.height = canvasSize.height;
    }
    document.body.appendChild(canvas);
  }

  var selectedScales = testScales.filter(function (obj) {
    if (selectedScale === undefined || !selectedScale || selectedScale === "") return true;
    if (typeof selectedScale === 'string') return obj.name == selectedScale;
    if (Array.isArray(selectedScale)) return selectedScale.indexOf(obj.name) > -1;
  });

  selectedScales.forEach(function (scale) {
    renderScale(scale, {selected: true});
  });
  if (allSmall) {
    testScales.forEach(function (scale,i) {
      console.log("===== testscale ====", scale.name || i);
      renderScale(scale, {
          name: scale.name
        }, {
          height: smallSizeFactor * shape[0] + 'px',
          width: smallSizeFactor * shape[1] + 'px'
        }
      );
    });
  }

})
;
