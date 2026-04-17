const RATES = {

  quality: {
    janta:   120,
    silver:  125,
    gold:    140,
    natural: 180
  },

  lamination: {
    none:    0,
    natural: 180,
    milky:   135
  },

  printing: {
    none:     0,
    one_side: 0.6,
    two_side: 1.1
  },

  width_19_modifier: 1,
  maxi_roll_modifier: 10,

  fixed_cost: 1.60,
  jumbo_extra_cost: 3.00,
  jumbo_min_width: 36,

  strength: {
    silver: { 2.5:35, 3.0:42, 3.5:48, 4.0:52, 4.5:55, 5.0:60 },
    gold:   { 2.5:45, 3.0:55, 3.5:60, 4.0:70, 4.5:80, 5.0:82 }
  },

  strength_max: 82

};
