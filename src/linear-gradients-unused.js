
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
