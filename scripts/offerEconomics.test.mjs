import test from 'node:test';
import assert from 'node:assert/strict';
import { estimatePartnerMargin, marginView, formatDollars } from '../src/data/offerEconomics.ts';

test('executive defaults match the locked example', () => {
  const view = marginView({ seats: '10', price: '10000', service: 'executive' });
  assert.equal(view.fee, 4000);
  assert.equal(view.monthlyDue, 40000);
  assert.equal(view.monthlyProfit, 60000);
  assert.equal(view.annualProfit, 720000);
  assert.equal(view.showProfit, true);
  assert.equal(view.showNoSpread, false);
  assert.equal(formatDollars(view.monthlyDue), '$40,000');
  assert.equal(formatDollars(view.monthlyProfit), '$60,000');
  assert.equal(formatDollars(view.annualProfit), '$720,000');
});

test('standard fee is $2,000 per seat and profit is the spread', () => {
  const view = marginView({ seats: '10', price: '10000', service: 'standard' });
  assert.equal(view.fee, 2000);
  assert.equal(view.monthlyDue, 20000);
  assert.equal(view.monthlyProfit, 80000);
  assert.equal(view.annualProfit, 960000);
  assert.equal(view.showProfit, true);
});

test('price equal to the fee has no spread and no positive profit', () => {
  const view = marginView({ seats: '3', price: '4000', service: 'executive' });
  assert.equal(view.hasSpread, false);
  assert.equal(view.showNoSpread, true);
  assert.equal(view.showProfit, false);
  assert.equal(view.monthlyDue, 12000);
  assert.equal(view.monthlyProfit, 0);
  assert.equal(view.annualProfit, 0);
  assert.ok(view.monthlyProfit <= 0);
});

test('price below the fee does not surface a positive or negative profit', () => {
  const estimate = estimatePartnerMargin({ seats: 2, pricePerSeat: 1999, service: 'standard' });
  assert.equal(estimate.hasSpread, false);
  assert.equal(estimate.monthlyProfit, 0);
  assert.equal(estimate.annualProfit, 0);
  assert.equal(estimate.monthlyDue, 4000);
});

test('one dollar of spread is profit, fractional seats count as whole seats', () => {
  const estimate = estimatePartnerMargin({ seats: 10.9, pricePerSeat: 4001, service: 'executive' });
  assert.equal(estimate.seats, 10);
  assert.equal(estimate.monthlyProfit, 10);
  assert.equal(estimate.annualProfit, 120);
});

test('blank inputs stay incomplete and negative seats do not create a bill', () => {
  const blank = marginView({ seats: '10', price: '', service: 'executive' });
  assert.equal(blank.incomplete, true);
  assert.equal(blank.showProfit, false);
  assert.equal(blank.showNoSpread, false);
  const negative = estimatePartnerMargin({ seats: -4, pricePerSeat: 10000, service: 'standard' });
  assert.equal(negative.seats, 0);
  assert.equal(negative.monthlyDue, 0);
  assert.equal(negative.monthlyProfit, 0);
});
