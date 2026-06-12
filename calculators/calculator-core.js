(function () {
  function toNumber(value, fallback) {
    var number = parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function getBoppRates() {
    return window.DP_CALCULATOR_RATES.bopp;
  }

  function calculateBoppBag(input) {
    var rates = getBoppRates();
    var width = toNumber(input.width, 0);
    var length = toNumber(input.length, 0);
    var gsm = String(input.gsm);
    var linerType = input.linerType || "none";
    var finish = input.finish || "glossy";
    var linerStitching = input.linerStitching || "linerWithoutBottomStitch";
    var gusset = input.gusset || "none";
    var lengthWithStitching = length + 1;

    var gsmAdjustment = rates.gsmRateAdjustment[gsm] || 0;
    var widthModifier = rates.widthRateModifier[String(width)] || 0;
    var gussetFabricModifier = gusset === "sideGusset" ? rates.gussetFabricRateModifier : 0;
    var fabricRate = rates.fabricBaseRate + gsmAdjustment + widthModifier + gussetFabricModifier;
    var boppRate = rates.boppFinishRates[finish] || rates.boppFinishRates.glossy;
    var sideMultiplier = rates.boppSideMultiplier;
    var linerRate = rates.linerRates[linerType] || 0;
    var hasLiner = linerType !== "none";
    var linerWeight = hasLiner ? toNumber(input.linerGram, 0) : 0;
    var linerStitchingCharge = hasLiner ? (rates.linerStitchingCharge[linerStitching] || 0) : 0;

    var planBagWeight = ((width * toNumber(gsm, 0) / 39.37) * lengthWithStitching) + rates.threadWeight;
    var laminationWeight = (width * rates.coatingGram / 39.37) * lengthWithStitching;
    var laminatedBagWeight = planBagWeight + laminationWeight;
    var boppWeight = (
      width *
      25.4 *
      lengthWithStitching *
      25.4 *
      rates.filmDensity *
      rates.filmMicron *
      sideMultiplier /
      1000000
    ) + rates.boppTrimGram;

    var totalWeight = laminatedBagWeight + boppWeight + linerWeight;

    var fabricCharge = (fabricRate / 1000) * (planBagWeight - rates.threadWeight);
    var laminationCharge = (rates.laminationRate / 1000) * laminationWeight;
    var boppCharge = (boppRate / 1000) * boppWeight;
    var linerCharge = (linerRate / 1000) * linerWeight;

    var costOneBag =
      fabricCharge +
      laminationCharge +
      boppCharge +
      linerCharge +
      linerStitchingCharge +
      rates.makingCharge;

    var finalPrice = costOneBag + rates.profitPerBag;

    return {
      width: width,
      length: length,
      gsm: gsm,
      totalWeight: totalWeight,
      finalPrice: finalPrice,
      breakdown: {
        fabricRate: fabricRate,
        planBagWeight: planBagWeight,
        laminationWeight: laminationWeight,
        laminatedBagWeight: laminatedBagWeight,
        boppWeight: boppWeight,
        linerWeight: linerWeight,
        fabricCharge: fabricCharge,
        laminationCharge: laminationCharge,
        boppCharge: boppCharge,
        linerCharge: linerCharge,
        linerStitchingCharge: linerStitchingCharge,
        costOneBag: costOneBag
      }
    };
  }

  function getBoppStrength(gsm) {
    var rates = getBoppRates();
    var value = rates.strengthByGsm[String(gsm)] || 0;
    var percent = rates.strengthMax ? value / rates.strengthMax : 0;
    var label = "Light Duty";
    var color = "#d64545";
    var description = "Suitable for lighter packaging.";

    if (percent >= 0.78) {
      label = "Extra Heavy Duty";
      color = "#185fa5";
      description = "Suitable for stronger industrial and export packaging.";
    } else if (percent >= 0.55) {
      label = "Heavy Duty";
      color = "#4f8a20";
      description = "Suitable for grain, cattle feed and bulk retail packaging.";
    } else if (percent >= 0.35) {
      label = "Medium Duty";
      color = "#d18719";
      description = "Suitable for common dry goods and 25 kg packing.";
    }

    return {
      value: value,
      max: rates.strengthMax,
      percent: Math.max(0, Math.min(1, percent)),
      label: label,
      color: color,
      description: description
    };
  }

  window.DP_CALCULATOR_CORE = {
    calculateBoppBag: calculateBoppBag,
    getBoppStrength: getBoppStrength
  };
})();
