/**
 * Unit tests for utility functions
 * Testing cn, formatCurrency, truncate, safeJsonParse, and other helpers
 */

import { describe, it, expect } from 'vitest';
import {
    cn,
    formatCurrency,
    truncate,
    safeJsonParse,
    debounce
} from '../../src/lib/utils';

describe('cn (className merger)', () => {
    it('should merge class names', () => {
        const result = cn('class1', 'class2');
        expect(result).toContain('class1');
        expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
        const isHidden = false;
        const isVisible = true;
        const result = cn('base', isHidden && 'hidden', isVisible && 'visible');
        expect(result).toContain('base');
        expect(result).toContain('visible');
        expect(result).not.toContain('hidden');
    });

    it('should handle undefined and null values', () => {
        const result = cn('base', undefined, null, 'active');
        expect(result).toContain('base');
        expect(result).toContain('active');
    });
});

describe('formatCurrency', () => {
    it('should format valid numbers as USD currency', () => {
        expect(formatCurrency(1234.56)).toBe('$1,235');
        expect(formatCurrency(1000000)).toBe('$1,000,000');
    });

    it('should handle string inputs', () => {
        expect(formatCurrency('1234.56')).toBe('$1,235');
    });

    it('should return "-" for invalid inputs', () => {
        expect(formatCurrency(null)).toBe('-');
        expect(formatCurrency(undefined)).toBe('-');
        expect(formatCurrency('invalid')).toBe('-');
    });

    it('should support custom currency and precision', () => {
        expect(formatCurrency(1234.56, 'EUR', 2)).toContain('1,234.56');
    });
});

describe('truncate', () => {
    it('should truncate long strings', () => {
        const longText = 'a'.repeat(150);
        const result = truncate(longText, 120);
        expect(result).toHaveLength(123); // 120 + '...'
        expect(result.endsWith('...')).toBe(true);
    });

    it('should not truncate short strings', () => {
        const shortText = 'Hello World';
        expect(truncate(shortText, 120)).toBe(shortText);
    });

    it('should handle empty strings', () => {
        expect(truncate('', 120)).toBe('');
    });
});

describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
        const json = '{"name":"test","value":123}';
        const result = safeJsonParse(json, {});
        expect(result).toEqual({ name: 'test', value: 123 });
    });

    it('should return fallback for invalid JSON', () => {
        const fallback = { default: true };
        expect(safeJsonParse('invalid json', fallback)).toEqual(fallback);
        expect(safeJsonParse(null, fallback)).toEqual(fallback);
        expect(safeJsonParse(undefined, fallback)).toEqual(fallback);
    });
});

describe('debounce', () => {
    it('should create a debounced function', () => {
        let callCount = 0;
        const increment = () => callCount++;
        const debounced = debounce(increment, 100);

        expect(typeof debounced).toBe('function');
    });
});
