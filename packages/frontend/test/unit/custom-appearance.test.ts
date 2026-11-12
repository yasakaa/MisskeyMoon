/*
 * SPDX-FileCopyrightText: sharkey-stelpolva contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { DEFAULT_VISIBILITY_COLORS as colors, emojiScale, getVisibilityStyle } from '../../src/utility/custom-appearance.js';

describe('custom note appearance', () => {
	test('restricted audiences take precedence over local-only', () => {
		expect(getVisibilityStyle({ visibility: 'followers', localOnly: true }, true, colors, 20).backgroundColor).toContain(colors.followers);
		expect(getVisibilityStyle({ visibility: 'specified', visibleUserIds: [], localOnly: true }, true, colors, 20).backgroundColor).toContain(colors.private);
		expect(getVisibilityStyle({ visibility: 'specified' }, true, colors, 20).backgroundColor).toContain(colors.specified);
	});
	test('ordinary public notes and disabled coloring keep the theme', () => {
		expect(getVisibilityStyle({ visibility: 'public' }, true, colors, 20)).toEqual({});
		expect(getVisibilityStyle({ visibility: 'followers' }, false, colors, 20)).toEqual({});
	});
	test('home and local-only colors remain distinct', () => {
		expect(getVisibilityStyle({ visibility: 'home' }, true, colors, 20).backgroundColor).toContain(colors.home);
		expect(getVisibilityStyle({ visibility: 'home', localOnly: true }, true, colors, 20).backgroundColor).toContain(colors.localOnly);
	});
	test('invalid imported colors and opacity cannot inject styles', () => {
		expect(getVisibilityStyle({ visibility: 'home' }, true, { ...colors, home: 'red;display:none' }, 20)).toEqual({});
		expect(getVisibilityStyle({ visibility: 'home' }, true, colors, Infinity).backgroundColor).toContain('20%');
		expect(getVisibilityStyle({ visibility: 'home' }, true, colors, 101).backgroundColor).toContain('100%');
	});
	test('imported emoji scales stay finite and within the supported range', () => {
		expect([emojiScale(0), emojiScale(100), emojiScale(1000), emojiScale(NaN)]).toEqual([0.5, 1, 1.5, 1]);
	});
});
