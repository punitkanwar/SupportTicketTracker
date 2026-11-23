import { describe, it, expect } from 'vitest';
import { getStatusColors, getPriorityColors, formatTicketId } from '../lib/utils.js';

describe('getStatusColors', () => {
  it('returns amber styling for Open', () => {
    const result = getStatusColors('Open');
    expect(result.badge).toContain('amber');
    expect(result.dot).toContain('amber');
  });

  it('returns blue styling for In Progress', () => {
    const result = getStatusColors('In Progress');
    expect(result.badge).toContain('blue');
    expect(result.dot).toContain('blue');
  });

  it('returns emerald styling for Resolved', () => {
    const result = getStatusColors('Resolved');
    expect(result.badge).toContain('emerald');
    expect(result.dot).toContain('emerald');
  });

  it('returns fallback for unknown status', () => {
    const result = getStatusColors('Unknown');
    expect(result.badge).toContain('zinc');
  });
});

describe('getPriorityColors', () => {
  it('returns emerald classes for Low', () => {
    expect(getPriorityColors('Low').badge).toContain('emerald');
  });

  it('returns yellow classes for Medium', () => {
    expect(getPriorityColors('Medium').badge).toContain('yellow');
  });

  it('returns orange classes for High', () => {
    expect(getPriorityColors('High').badge).toContain('orange');
  });

  it('returns red classes for Urgent', () => {
    expect(getPriorityColors('Urgent').badge).toContain('red');
  });
});

describe('formatTicketId', () => {
  it('formats a 24-char Mongo ID to last 6 uppercase chars with #', () => {
    const id = 'abc123def456789012345678';
    expect(formatTicketId(id)).toBe('#345678');
  });

  it('returns #— for null/undefined', () => {
    expect(formatTicketId(null)).toBe('#—');
    expect(formatTicketId(undefined)).toBe('#—');
  });
});
