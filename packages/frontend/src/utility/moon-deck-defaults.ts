/*
 * SPDX-FileCopyrightText: misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Column } from '@/deck.js';

export function initialUi(savedUi: string | null, width: number): string {
	return savedUi ?? (width > 1024 ? 'deck' : 'default');
}

export function initialDeckColumns(width: number): Column[] {
	if (width <= 1024) return [];
	return [
		{ id: 'moon-main', type: 'main', name: null, width: 350, flexible: true },
		{ id: 'moon-notifications', type: 'notifications', name: null, width: 330 },
		{ id: 'moon-mentions', type: 'mentions', name: null, width: 330 },
	];
}
