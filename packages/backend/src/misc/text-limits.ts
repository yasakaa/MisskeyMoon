/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const DEFAULT_TEXT_LIMITS = {
	maxNoteLength: 3000,
	maxRemoteNoteLength: 100000,
	maxCwLength: 500,
	maxRemoteCwLength: 5000,
	maxAltTextLength: 20000,
	maxRemoteAltTextLength: 100000,
	maxBioLength: 1500,
	maxRemoteBioLength: 15000,
};

export type TextLimits = typeof DEFAULT_TEXT_LIMITS;

export function resolveTextLimits(source: Partial<TextLimits>): TextLimits {
	const result = { ...DEFAULT_TEXT_LIMITS };
	for (const key of Object.keys(result) as (keyof TextLimits)[]) {
		const value = source[key] ?? result[key];
		if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${key} must be a positive safe integer`);
		result[key] = value;
	}
	for (const [local, remote] of [
		['maxNoteLength', 'maxRemoteNoteLength'], ['maxCwLength', 'maxRemoteCwLength'],
		['maxAltTextLength', 'maxRemoteAltTextLength'], ['maxBioLength', 'maxRemoteBioLength'],
	] as const) {
		if (result[remote] < result[local]) throw new Error(`${remote} must be at least ${local}`);
	}
	return result;
}
