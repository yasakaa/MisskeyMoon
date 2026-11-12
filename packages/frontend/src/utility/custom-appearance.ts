/*
 * SPDX-FileCopyrightText: sharkey-stelpolva contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const DEFAULT_VISIBILITY_COLORS = {
	home: '#00ffff', followers: '#ff00ff', localOnly: '#64ff64', specified: '#0000ff', private: '#6464ff',
};

export type VisibilityColorKey = keyof typeof DEFAULT_VISIBILITY_COLORS;

export function emojiScale(value: number): number {
	return Number.isFinite(value) ? Math.min(150, Math.max(50, value)) / 100 : 1;
}

export function getVisibilityStyle(
	note: { visibility: string; localOnly?: boolean; visibleUserIds?: string[] },
	enabled: boolean, colors: Record<VisibilityColorKey, string>, opacity: number, panel = 'panel',
) {
	if (!enabled) return {};
	const key = note.visibility === 'specified'
		? (note.visibleUserIds?.length === 0 ? 'private' : 'specified')
		: note.visibility === 'followers' ? 'followers'
			: note.localOnly ? 'localOnly'
				: note.visibility === 'home' ? 'home' : null;
	if (key == null || !/^#[0-9a-f]{6}$/i.test(colors[key])) return {};
	const alpha = Number.isFinite(opacity) ? Math.min(100, Math.max(0, opacity)) : 20;
	return { backgroundColor: `color-mix(in srgb, var(--MI_THEME-${panel}), ${colors[key]} ${alpha}%)` };
}
