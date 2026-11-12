/*
 * SPDX-FileCopyrightText: misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { expect, test } from 'vitest';
import { soundAssetUrl } from '@/utility/sound-asset-url.js';

test('標準音源とサブフォルダーのパスを維持する', () => {
	expect(soundAssetUrl('syuilo/n-aec')).toBe('/client-assets/sounds/syuilo/n-aec.mp3');
	expect(soundAssetUrl('custom/pack/chime')).toBe('/client-assets/sounds/custom/pack/chime.mp3');
});

test('記号や日本語をURLの構造ではなくファイル名として扱う', () => {
	const url = new URL(soundAssetUrl('custom/通知 #1?100%'), 'https://example.com');
	expect(url.search).toBe('');
	expect(url.hash).toBe('');
	expect(decodeURIComponent(url.pathname)).toBe('/client-assets/sounds/custom/通知 #1?100%.mp3');
});
