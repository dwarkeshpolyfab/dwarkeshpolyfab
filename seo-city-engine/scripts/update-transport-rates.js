const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '..', 'data', 'cities.json');
const transportPath = path.join(__dirname, '..', 'data', 'transport-rates.json');

const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
const transportData = JSON.parse(fs.readFileSync(transportPath, 'utf8'));

transportData.freight_matrix = cities.map(c => ({
  city_id: c.city_id,
  city_name: c.city_name,
  state: c.state,
  region: c.region,
  approx_distance_km: c.approx_distance_from_morbi_km,
  corridor: c.primary_highway_corridor,
  transit_days: c.estimated_transit_days,
  freight_per_kg_ftl: c.freight_rate_per_kg,
  freight_per_kg_ptl: Math.round((c.freight_rate_per_kg * 1.25) * 100) / 100,
  primary_unloading_hub: c.primary_transport_hub
}));

fs.writeFileSync(transportPath, JSON.stringify(transportData, null, 2), 'utf8');
console.log(`✓ Updated transport-rates.json with ${transportData.freight_matrix.length} cities!`);
