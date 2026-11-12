/*
 * SPDX-FileCopyrightText: sharkey-stelpolva contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { computed } from 'vue';
import { prefer } from '@/preferences.js';
import { emojiScale, getVisibilityStyle } from '@/utility/custom-appearance.js';

export const noteEmojiStyle = computed(() => ({
	'--stpv-note-emoji-height': `${3 * emojiScale(prefer.s.stpvNoteEmojiScale)}em`,
}));

export function visibilityColorStyle(note: Parameters<typeof getVisibilityStyle>[0], panel = 'panel') {
	return getVisibilityStyle(note, prefer.s.stpvVisibilityColorsEnabled, prefer.s.stpvVisibilityColors, prefer.s.stpvVisibilityColorOpacity, panel);
}
