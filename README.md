# ndarray-heatmap

Renders ndarray into a canvas.

[![Travis build status](http://img.shields.io/travis/akngs/ndarray-heatmap.svg?style=flat)](https://travis-ci.org/akngs/ndarray-heatmap)
[![Code Climate](https://codeclimate.com/github/akngs/ndarray-heatmap/badges/gpa.svg)](https://codeclimate.com/github/akngs/ndarray-heatmap)
[![Test Coverage](https://codeclimate.com/github/akngs/ndarray-heatmap/badges/coverage.svg)](https://codeclimate.com/github/akngs/ndarray-heatmap)
[![Dependency Status](https://david-dm.org/akngs/ndarray-heatmap.svg)](https://david-dm.org/akngs/ndarray-heatmap)
[![devDependency Status](https://david-dm.org/akngs/ndarray-heatmap/dev-status.svg)](https://david-dm.org/akngs/ndarray-heatmap#info=devDependencies)

## Install

    npm install ndarray-heatmap

## Example

    var heatmap = require('ndarray-heatmap');
    var pack = require('ndarray-pack');

    var array = pack([
        [0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 1, 2, 2, 1, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0]
    ]);
    var renderer = heatmap()
        .data(array)
        .colorRange(['#000000', '#FFFFFF']);

    var canvas = renderer();

Or, you can provide existing canvas element:

    var canvas = document.createElement('canvas');
    renderer(canvas);

If you are not familiar with ``ndarray`` please read [scijs documentation](http://scijs.net/packages/).

