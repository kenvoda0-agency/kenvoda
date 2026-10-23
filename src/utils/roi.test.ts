import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRoi, calculateCleaningEstimate } from './roi.ts';

test('ROI calculation matches default values exactly', () => {
  // defaults: inquiries = 200, jobValue = 150, missedCalls = 20
  const result = calculateRoi({ inquiries: 200, jobValue: 150, missedCalls: 20 });
  
  // lostFromMissed = 20 * 150 * 0.35 = 1050
  assert.equal(result.lostFromMissed, 1050);
  
  // lostFromSlowLeads = 200 * 0.10 * 150 * 0.35 = 1050
  assert.equal(result.lostFromSlowLeads, 1050);
  
  // monthlyLoss = 1050 + 1050 = 2100
  assert.equal(result.monthlyLoss, 2100);
  
  // recovered = 2100 * 0.65 = 1365
  assert.equal(result.recovered, 1365);
  
  // uplift = 200 * 0.05 * 150 = 1500
  assert.equal(result.uplift, 1500);
  
  // extraRevenue = 1365 + 1500 = 2865
  assert.equal(result.extraRevenue, 2865);
  
  // annualLoss = 2100 * 12 = 25200
  assert.equal(result.annualLoss, 25200);
  
  // annualExtraRevenue = 2865 * 12 = 34380
  assert.equal(result.annualExtraRevenue, 34380);
  
  // currentBookings = Math.round(200 * 0.35) = 70
  assert.equal(result.currentBookings, 70);
});

test('ROI calculation handles clamping and edge cases safely', () => {
  // Out of bounds below min
  const minResult = calculateRoi({ inquiries: 10, jobValue: 5, missedCalls: 0 });
  assert.equal(minResult.lostFromMissed, 1 * 50 * 0.35); // clamped to 1 missed, 50 job, 50 inquiries
  
  // Out of bounds above max
  const maxResult = calculateRoi({ inquiries: 1000, jobValue: 5000, missedCalls: 500 });
  assert.equal(maxResult.lostFromMissed, 100 * 1000 * 0.35); // clamped to 100 missed, 1000 job, 500 inquiries
});

test('Cleaning estimate calculations match demo rates and multipliers', () => {
  // 3 bedrooms, 2 bathrooms, One-time
  // base = 80, 3*20 = 60, 2*25 = 50. Subtotal = 190. Multiplier = 1.0 => 190
  assert.equal(calculateCleaningEstimate(3, 2, 'onetime'), 190);
  
  // 3 bedrooms, 2 bathrooms, Bi-weekly (0.9 multiplier)
  // 190 * 0.9 = 171
  assert.equal(calculateCleaningEstimate(3, 2, 'biweekly'), 171);

  // 3 bedrooms, 2 bathrooms, Weekly (0.85 multiplier)
  // 190 * 0.85 = 161.5 => round 162
  assert.equal(calculateCleaningEstimate(3, 2, 'weekly'), 162);

  // 3 bedrooms, 2 bathrooms, Monthly (1.05 multiplier)
  // 190 * 1.05 = 199.5 => round 200
  assert.equal(calculateCleaningEstimate(3, 2, 'monthly'), 200);
});
