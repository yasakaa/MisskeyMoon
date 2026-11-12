/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { DEFAULT_TEXT_LIMITS, resolveTextLimits } from '@/misc/text-limits.js';

describe('configurable text limits', () => {
	test('uses Sharkey-compatible defaults without mutating them', () => {
		expect(resolveTextLimits({})).toEqual(DEFAULT_TEXT_LIMITS);
		expect(resolveTextLimits({ maxNoteLength: 5000 }).maxNoteLength).toBe(5000);
		expect(DEFAULT_TEXT_LIMITS.maxNoteLength).toBe(3000);
	});
	test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])('rejects invalid values: %s', (value) => {
		expect(() => resolveTextLimits({ maxCwLength: value })).toThrow('positive safe integer');
	});
	test('rejects a remote cap below the local cap', () => {
		expect(() => resolveTextLimits({ maxNoteLength: 100001 })).toThrow('maxRemoteNoteLength');
	});
});
