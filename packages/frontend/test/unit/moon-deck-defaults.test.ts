/*
 * SPDX-FileCopyrightText: misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { initialDeckColumns, initialUi } from '@/utility/moon-deck-defaults.js';

describe('MisskeyMoon initial desktop layout', () => {
	test('uses deck only for an unset desktop UI', () => {
		expect(initialUi(null, 1440)).toBe('deck');
		expect(initialUi(null, 1024)).toBe('default');
		expect(initialUi(null, 390)).toBe('default');
		expect(initialUi('default', 1440)).toBe('default');
		expect(initialUi('deck', 390)).toBe('deck');
	});

	test('desktop main column fills remaining space while notifications and mentions retain standard width', () => {
		const columns = initialDeckColumns(1440);
		expect(columns).toHaveLength(3);
		expect(columns[0]).toMatchObject({ type: 'main', flexible: true });
		expect(columns[1]).toMatchObject({ type: 'notifications', width: 330 });
		expect(columns[1].flexible).not.toBe(true);
		expect(columns[2]).toMatchObject({ type: 'mentions', width: 330 });
		expect(columns[2].flexible).not.toBe(true);
		expect(new Set(columns.map(column => column.id)).size).toBe(3);
		expect(initialDeckColumns(390)).toEqual([]);
	});
});
