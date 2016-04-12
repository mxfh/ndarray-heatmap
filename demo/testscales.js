var testScales = {
  'array': colorbrewer.BuGn[5],
  'bw': ['black', 'white'],
  'string': 'purple',
  'brewerJoined': colorbrewer.BuGn[5].concat(colorbrewer.YlGnBu[5]),
  'brewerSplit': [colorbrewer.BuGn[5],colorbrewer.YlGnBu[5]],
  'proper1': {
    name: 'proper',
    optimize: false,
    segments: [
      {gradient: 'red'},
      {gradient: 'blue'}
    ]
  },
  proper2: {
    name: 'proper2',
    segments: [
      {gradient: 'red', width: 0.25},
      {gradient: 'blue', width: 0.25},
      {gradient: 'yellow'}
    ]
  },
  proper3optimize: {
    name: 'proper3',
    optimize : true,
    segments: [
      {gradient: ['red', 'blue', 'yellow', 'grey', 'blue'], width: 0.5},
      {gradient: 'blue'},
      {gradient: 'yellow'}
    ]
  },
  proper4: {
    name: 'proper4',
    //optimize : true,
    segments: [{
      name: 'ynlb',
      gradient: [
        "rgba(255,255,204,1)",
        "rgba(161,218,180,1)",
        "rgba(65,182,196,0.5)",
        "rgba(44,127,184,1)",
        "rgba(37,52,148,1)"
      ]
    }
    ]
  },
  'unnamed': {
    selected: true,
    segments: [
      [colorbrewer.YlGnBu[5], 0.25],
      colorbrewer.BuGn[5]
    ]
  },
  'twoArrays': [
    [colorbrewer.YlGnBu[5], 0.1],
    colorbrewer.BuGn[5]
  ],
  'segmented': {
    name: 'div',
    segments: [
      {gradient: colorbrewer.YlGnBu[5]},
      {gradient: colorbrewer.BuGn[5]}
    ]
  },
  'arrOfArrs': [
    ["rgba(255,255,204,1)"],
    ["rgba(161,218,180,1)"],
    ["rgba(65,182,196,0.5)"],
    ["rgba(44,127,184,1)"],
    ["rgba(37,52,148,1)"]
  ],
  arrOfArraysMixed: [
    [
      "rgba(255,255,204,1)",
      "rgba(161,218,180,1)",
      "rgba(65,182,196,0.5)"
    ],
    [
      "rgba(44,127,184,1)"
    ],
    "rgba(37,52,148,1)"
  ],
  bareGradient: {
    name: 'bare',
    gradient: [
      "rgba(255,255,204,1)",
      "rgba(161,218,180,1)",
      "rgba(65,182,196,0.5)",
      "rgba(44,127,184,1)",
      "rgba(37,52,148,1)"
    ]
  },
  monostring: {
    name: 'monostring',
    gradient: 'red'
  },
  mono: {
    name: 'mono',
    gradient: ['red']
  },
  bi: {
    name: 'bi',
    gradient: ['black', 'white']
  },
  arrOfArrFlat: [
    ['red', 'red'],
    ['blue', 'blue']
  ],
  aa2: [['red'], ['blue']
  ],
  aaStyled: [['red', 'blue'],
    {
      style: 'flat'
    }
  ],
  simple: {
    name: 'simple',
    segments: [colorbrewer.YlGnBu[5]]
  },
  simple2: {
    name: 'simple',
    gradient: colorbrewer.YlGnBu[5]
  },
  simpleMixed: {
    name: 'simpleMixed',
    gradient: [
      "rgba(255,255,204,0)",
      "rgba(161,218,180,1)",
      "rgba(65,182,196,1)",
      "rgba(44,127,184,1)",
      "rgba(37,52,148,1)"
    ]
  },
  arrOfArr3: [
    colorbrewer.Blues[5].slice(),
    colorbrewer.Blues[5].slice().reverse(),
    colorbrewer
      .Blues[5].slice()
  ],
  moreArrs: [
    [colorbrewer.Blues[5].slice(), 0.8],
    colorbrewer.Blues[5].slice()
  ],
  iso: [
    "rgba(65,182,196,0)",
    "rgba(65,182,196,0.5)",
    "rgba(44,127,184,1)",
    "rgb(37,52,148)",
    [["rgba(37,52,148,1)", "#ffffd4"], 0.002
    ],
// for smooth "anti-aliased" breaks add a narrow width
// which connect the neighboring end-color ranges
// for god results increase color steps accordingly
    [colorbrewer.YlOrBr[5].slice(), 0.200],
    ["red", 0.1],
    [colorbrewer.Blues[5].slice().reverse(), 0.125],
    "blue",
    "red",
    colorbrewer.Blues[5].slice(),
    "red",
    [colorbrewer.Blues[5].slice().reverse()],
    "red",
    "rgba(255,0,0,0)"
  ],
  iso2: [
    ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    ["rgba(0,0,0,0)", "rgba(0,0,0,1)", "rgba(0,0,0,0)", 0.05
    ],
    ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    ["rgba(0,0,0,0)", "rgba(0,0,0,1)", "rgba(0,0,0,0)", 0.1],
    ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    ["rgba(0,0,0,0)", "rgba(0,0,0,1)", "rgba(0,0,0,0)", 0.1]

  ],
  iso3: [
    ["rgba(0,0,255,0.1)"],
    ["blue", 0.05
    ],
    ["rgba(0,0,0,0)"],
    ["green", 0.05],
    ["rgba(0,0,0,0)"],
    ["yellow", 0.05],
    ["rgba(0,0,0,0)"],
    ["red", 0.05],
    ["rgba(255,0,0,0.2)"]

  ],
  iso4: [
    [["rgba(255,255,204,0.5)"], 0.15],
    ["rgba(255,255,204,1)", 0.05
    ],
    [["rgba(161,218,180,0.5)"], 0.8],
    [["rgba(161,218,180,1)"], 0.05],
    ["rgba(65,182,196,0.5)", 0.15],
    ["rgba(65,182,196,1)", 0.05],
    [["rgba(44,127,184,0.5)", "rgba(44,127,184,0.5)"], 0.15],
    [["rgba(44,127,184,0.5", "rgba(44,127,184,1", "rgba(44,127,184,1", "rgba(37,52,148,0.5)"], 0.05],
    [["rgba(37,52,148,0.5)", "rgba(37,52,148,0.5)"], 0.15],
    [["rgba(37,52,148,1)", "rgba(37,52,148,1)"], 0.05]
  ]
};
