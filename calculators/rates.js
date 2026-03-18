/* ============================================================ */
/* calculators/rates.js — Dwarkesh Polyfab                      */
/* ALL PRICE RATES IN ONE FILE                                  */
/* Change prices here — calculator updates automatically        */
/* ============================================================ */

const RATES = {

  /* ── QUALITY RATES (₹ per kg) ── */
  quality: {
    janta:   100,   // Economy
    silver:  105,   // Standard
    gold:    110,   // Premium
    natural: 125    // Best Quality / Virgin
  },

  /* ── LAMINATION RATES (₹ per kg) ── */
  lamination: {
    none:    0,
    natural: 92,
    milky:   125
  },

  /* ── PRINTING RATES (₹ per bag) ── */
  printing: {
    none:     0,
    one_side: 0.5,
    two_side: 1.0
  },

  /* ── GSM MODIFIERS (subtracted from quality rate) ── */
  gsm_modifier: {
    3.0:  -1,
    3.5:  -1,
    4.0:  -2,
    4.5:  -2
  },

  /* ── WIDTH 19 INCH MODIFIER ── */
  width_19_modifier: +1,

  /* ── MAXI ROLL MODIFIER (width >= 36 inches) ── */
  maxi_roll_modifier: +10,

  /* ── FIXED COST PER BAG ── */
  
fixed_cost: 1.60,
jumbo_extra_cost: 3.00,   // extra per bag for jumbo sizes (width >= 36)
jumbo_min_width: 36,      // width from which jumbo pricing applies
  /* ── STRENGTH RATINGS ── */
  strength: {
    silver: { 2.5:35, 3.0:42, 3.5:48, 4.0:52, 4.5:55, 5.0:60 },
    gold:   { 2.5:45, 3.0:55,, 3.5:60, 4.0:70, 4.5:80, 5.0:82 }
  },

  strength_max: 82

};
