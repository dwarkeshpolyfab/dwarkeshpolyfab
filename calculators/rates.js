window.DP_CALCULATOR_RATES = {
  pp: {
    quality: {
      janta: 115,
      silver: 122,
      gold: 128,
      natural: 170
    },

    lamination: {
      none: 0,
      natural: 170,
      milky: 120
    },

    printing: {
      none: 0,
      one_side: 0.6,
      two_side: 1.1
    },

    width_19_modifier: 1,
    maxi_roll_modifier: 10,

    fixed_cost: 1.60,
    jumbo_extra_cost: 3.00,
    jumbo_min_width: 36,

    strength: {
      silver: { 2.5: 35, 3.0: 42, 3.5: 48, 4.0: 52, 4.5: 55, 5.0: 60 },
      gold: { 2.5: 45, 3.0: 55, 3.5: 60, 4.0: 70, 4.5: 80, 5.0: 82 }
    },

    strength_max: 82
  },

  bopp: {
    fabricBaseRate: 132,
    gsmRateAdjustment: {
      "2.5": 0,
      "3": -1,
      "3.5": -1,
      "4": -2,
      "4.5": -2
    },

    widthRateModifier: {
      "15": 7,
      "17": 4,
      "19": 1
    },

    coatingGram: 0.70,
    laminationRate: 180,
    filmMicron: 12,
    filmDensity: 0.91,
    boppTrimGram: 0.20,
    threadWeight: 1.00,

    boppFinishRates: {
      glossy: 477,
      matt: 525
    },

    boppSideMultiplier: 2,

    linerRates: {
      none: 0,
      natural: 160,
      semiNatural: 140,
      milky: 120
    },

    linerStitchingCharge: {
      linerWithBottomStitch: 0.80,
      linerWithoutBottomStitch: 0.40
    },

    gussetFabricRateModifier: 4,
    makingCharge: 0.40,
    profitPerBag: 1.20,
    moq: "10,000 bags",

    strengthByGsm: {
      "2.5": 45,
      "3": 55,
      "3.5": 60,
      "4": 70,
      "4.5": 80
    },

    strengthMax: 82
  }
};

var RATES = window.DP_CALCULATOR_RATES.pp;
