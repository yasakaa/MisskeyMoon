<!--
SPDX-FileCopyrightText: sharkey-stelpolva contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/custom" :label="i18n.ts._customSettings.title" :keywords="['stelpolva', 'emoji', 'visibility', 'garo']" icon="ti ti-adjustments">
	<div class="_gaps_m">
		<MkInfo>{{ i18n.ts._customSettings.description }}</MkInfo>
		<FormSection>
			<template #label>{{ i18n.ts._customSettings.emojiSize }}</template>
			<div class="_gaps_m">
				<div :class="$style.preview" inert>
					{{ i18n.ts._customSettings.sample }}
					<img src="/client-assets/unlocked_3d.png" :alt="i18n.ts._customSettings.noteEmoji" :style="{ height: `${3 * emojiScale(noteScale)}em` }">
					<span role="img" :aria-label="i18n.ts._customSettings.reactionEmoji" :style="{ fontSize: `${1.5 * emojiScale(reactionScale)}em` }">👍</span>
				</div>
				<label class="_gaps_s">
					<span>{{ i18n.ts._customSettings.noteEmoji }}: {{ noteScale }}%</span>
					<input v-model.number="noteScale" :class="$style.slider" type="range" min="50" max="150" step="5">
				</label>
				<label class="_gaps_s">
					<span>{{ i18n.ts._customSettings.reactionEmoji }}: {{ reactionScale }}%</span>
					<input v-model.number="reactionScale" :class="$style.slider" type="range" min="50" max="150" step="5">
				</label>
				<MkSwitch v-model="limitWidth">{{ i18n.ts._customSettings.limitReactionWidth }}</MkSwitch>
			</div>
		</FormSection>
		<FormSection>
			<template #label>{{ i18n.ts._customSettings.visibilityColors }}</template>
			<div class="_gaps_m">
				<MkSwitch v-model="colorsEnabled">{{ i18n.ts._customSettings.enableColors }}</MkSwitch>
				<template v-if="colorsEnabled">
					<label v-for="key in colorKeys" :key="key" :class="$style.color">
						<span>{{ colorLabels[key] }}</span>
						<input type="color" :value="colors[key]" @input="setColor(key, $event)">
					</label>
					<label class="_gaps_s">
						<span>{{ i18n.ts._customSettings.opacity }}: {{ opacity }}%</span>
						<input v-model.number="opacity" :class="$style.slider" type="range" min="0" max="100" step="1">
					</label>
					<div v-for="key in colorKeys" :key="key" :class="$style.preview" :style="previewColor(key)">{{ colorLabels[key] }}</div>
				</template>
			</div>
		</FormSection>
		<FormSection>
			<template #label>{{ i18n.ts._customReading.title }}</template>
			<MkSwitch v-model="collapseReplySource">
				{{ i18n.ts._customReading.collapseReplySource }}
				<template #caption>{{ i18n.ts._customReading.collapseReplySourceDescription }}</template>
			</MkSwitch>
		</FormSection>
		<FormLink to="/settings/sounds">{{ i18n.ts._customSettings.sounds }}</FormLink>
		<MkButton @click="reset">{{ i18n.ts._customSettings.reset }}</MkButton>
	</div>
</SearchMarker>
</template>

<script setup lang="ts">
import { prefer } from '@/preferences.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';
import MkInfo from '@/components/MkInfo.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import FormLink from '@/components/form/link.vue';
import { DEFAULT_VISIBILITY_COLORS, emojiScale, getVisibilityStyle } from '@/utility/custom-appearance.js';
import type { VisibilityColorKey } from '@/utility/custom-appearance.js';

const noteScale = prefer.model('stpvNoteEmojiScale');
const reactionScale = prefer.model('stpvReactionEmojiScale');
const limitWidth = prefer.model('limitWidthOfReaction');
const colorsEnabled = prefer.model('stpvVisibilityColorsEnabled');
const colors = prefer.model('stpvVisibilityColors');
const opacity = prefer.model('stpvVisibilityColorOpacity');
const collapseReplySource = prefer.model('stpvCollapseReplySource');
const colorKeys = Object.keys(DEFAULT_VISIBILITY_COLORS) as VisibilityColorKey[];
const colorLabels = {
	home: i18n.ts._visibility.home,
	followers: i18n.ts._visibility.followers,
	localOnly: i18n.ts._visibility.disableFederation,
	specified: i18n.ts._visibility.specified,
	private: i18n.ts._customSettings.onlyMe,
};

function setColor(key: VisibilityColorKey, event: Event) {
	colors.value = { ...colors.value, [key]: (event.target as HTMLInputElement).value };
}

function previewColor(key: VisibilityColorKey) {
	return getVisibilityStyle({ visibility: key === 'private' ? 'specified' : key === 'localOnly' ? 'public' : key, localOnly: key === 'localOnly', visibleUserIds: key === 'private' ? [] : ['preview'] }, true, colors.value, opacity.value);
}

function reset() {
	noteScale.value = 100;
	reactionScale.value = 100;
	limitWidth.value = false;
	colorsEnabled.value = false;
	colors.value = { ...DEFAULT_VISIBILITY_COLORS };
	opacity.value = 20;
	collapseReplySource.value = false;
}

definePage(() => ({ title: i18n.ts._customSettings.title, icon: 'ti ti-adjustments' }));
</script>

<style lang="scss" module>
.preview {
	padding: 16px;
	border: 1px solid var(--MI_THEME-divider);
	border-radius: var(--MI-radius);
	background: var(--MI_THEME-panel);
	overflow: auto;
}

.slider {
	display: block;
	width: 100%;
	min-height: 2.75rem;
	accent-color: var(--MI_THEME-accent);
}

.color {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;

	> input {
		min-width: 44px;
		min-height: 44px;
	}
}
</style>
