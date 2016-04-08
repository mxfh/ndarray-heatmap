var testScaleShort = [
  [
    [heatmap.colorbrewer.YlGnBu[5], 0.25],
    heatmap.colorbrewer.BuGn[5]
  ],
  {
    //selected: true,
    name: '1a',
    //optimize : true,
    segments: [
      [heatmap.colorbrewer.YlGnBu[5], 0.25],
      heatmap.colorbrewer.BuGn[5]
    ]
  },
  {
    name: 'div',
    segments: [
      {gradient: heatmap.colorbrewer.YlGnBu[5], width: 0.25},
      {gradient: heatmap.colorbrewer.BuGn[5]}
    ]
  }
];


var testScales = [
  {
    name: 'proper',
    optimize: false,
    segments: [
      {gradient: 'red'},
      {gradient: 'blue'}
    ]
  },
  {
    selected: true,
    segments: [
      [heatmap.colorbrewer.YlGnBu[5], 0.25],
      heatmap.colorbrewer.BuGn[5]
    ]
  },
  [
    [heatmap.colorbrewer.YlGnBu[5], 0.1],
    heatmap.colorbrewer.BuGn[5]
  ],
  {
    name: 'div',
    segments: [
      {gradient: heatmap.colorbrewer.YlGnBu[5]},
      {gradient: heatmap.colorbrewer.BuGn[5]}
    ]
  },


  [
    "rgba(255,255,204,1)",
    "rgba(161,218,180,1)",
    "rgba(65,182,196,0.5)",
    "rgba(44,127,184,1)",
    "rgba(37,52,148,1)"
  ],
  [
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
  [
    "rgba(255,255,204,1)",
    "rgba(161,218,180,1)",
    "rgba(65,182,196,0.5)",
    "rgba(44,127,184,1)",
    "rgba(37,52,148,1)"
  ],
  {
    name: 'proper2',
    segments: [
      {gradient: 'red', width: 0.25},
      {gradient: 'blue', width: 0.25},
      {gradient: 'yellow'}
    ]
  }, {
    name: 'proper3',
    segments: [
      {gradient: ['red', 'blue', 'yellow'], width: 0.5},
      {gradient: 'blue'},
      {gradient: 'yellow'}
    ]
  },
  {
    name: 'proper4',
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
  {
    name: 'bare',
    gradient: [
      "rgba(255,255,204,1)",
      "rgba(161,218,180,1)",
      "rgba(65,182,196,0.5)",
      "rgba(44,127,184,1)",
      "rgba(37,52,148,1)"
    ]

  },
  {
    name: 'monostring',
    gradient: 'red'
  },
  {
    name: 'mono',
    gradient: ['red']
  },
  {
    name: 'bi',
    gradient: ['black', 'white']
  },
  [
    ['red', 'red'],
    ['blue', 'blue']
  ]
  ,
  [['red'], ['blue']]
  ,

  [['red', 'blue'], {style: 'flat'}]
  ,
  {
    name: 'simple',
    gradient: heatmap.colorbrewer.YlGnBu[5]
  },
  {
    name: 'simpleMixed',
    gradient: [
      "rgba(255,255,204,0)",
      "rgba(161,218,180,1)",
      "rgba(65,182,196,1)",
      "rgba(44,127,184,1)",
      "rgba(37,52,148,1)"
    ]
  },
  [
    heatmap.colorbrewer.Blues[5].slice(),
    heatmap.colorbrewer.Blues[5].slice().reverse(),
    heatmap.colorbrewer.Blues[5].slice()
  ]
  ,

  [
    [heatmap.colorbrewer.Blues[5].slice(), 0.8],
    heatmap.colorbrewer.Blues[5].slice()
  ]
  ,

  [
    "rgba(65,182,196,0)",
    "rgba(65,182,196,0.5)",
    "rgba(44,127,184,1)",
    "rgb(37,52,148)",
    [["rgba(37,52,148,1)", "#ffffd4"], 0.002],
    // for smooth "anti-aliased" breaks add a narrow width
    // which connect the neighboring end-color ranges
    // for god results increase color steps accordingly
    [heatmap.colorbrewer.YlOrBr[5].slice(), 0.200],
    ["red", 0.1],
    [heatmap.colorbrewer.Blues[5].slice().reverse(), 0.125],
    "blue",
    "red",
    heatmap.colorbrewer.Blues[5].slice(),
    "red",
    [heatmap.colorbrewer.Blues[5].slice().reverse()],
    "red",
    "rgba(255,0,0,0)"
  ]
  ,
  [
    ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    ["rgba(0,0,0,0)", "rgba(0,0,0,1)", "rgba(0,0,0,0)", 0.05],
    ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    ["rgba(0,0,0,0)", "rgba(0,0,0,1)", "rgba(0,0,0,0)", 0.1],
    ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    ["rgba(0,0,0,0)", "rgba(0,0,0,1)", "rgba(0,0,0,0)", 0.1]

  ],
  [
    ["rgba(0,0,255,0.1)"],
    ["blue", 0.05],
    ["rgba(0,0,0,0)"],
    ["green", 0.05],
    ["rgba(0,0,0,0)"],
    ["yellow", 0.05],
    ["rgba(0,0,0,0)"],
    ["red", 0.05],
    ["rgba(255,0,0,0.2)"]

  ]
  , [
    [["rgba(255,255,204,0.5)"], 0.15],
    ["rgba(255,255,204,1)", 0.05],
    [["rgba(161,218,180,0.5)"], 0.8],
    [["rgba(161,218,180,1)"], 0.05],
    ["rgba(65,182,196,0.5)", 0.15],
    ["rgba(65,182,196,1)", 0.05],
    [["rgba(44,127,184,0.5)", "rgba(44,127,184,0.5)"], 0.15],
    [["rgba(44,127,184,0.5", "rgba(44,127,184,1", "rgba(44,127,184,1", "rgba(37,52,148,0.5)"], 0.05],
    [["rgba(37,52,148,0.5)", "rgba(37,52,148,0.5)"], 0.15],
    [["rgba(37,52,148,1)", "rgba(37,52,148,1)"], 0.05]

  ]

];
