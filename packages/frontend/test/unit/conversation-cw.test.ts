/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { afterEach, describe, expect, test } from 'vitest';
import { createApp, defineComponent, h, nextTick, provide, ref } from 'vue';
import type { App, Ref } from 'vue';
import { conversationCwKey, useConversationCw } from '../../src/composables/use-conversation-cw.js';

const apps: App[] = [];
afterEach(() => { for (const app of apps.splice(0)) app.unmount(); });

function mountConversation(control?: Ref<boolean | undefined>) {
	const visible: Ref<boolean>[] = [];
	const addReply = ref(false);
	const Child = defineComponent({
		setup() {
			const state = useConversationCw();
			visible.push(state);
			return () => h('span', String(state.value));
		},
	});
	const Parent = defineComponent({
		setup() {
			if (control) provide(conversationCwKey, control);
			return () => h('div', [h(Child), ...(addReply.value ? [h(Child, { key: 'later' })] : [])]);
		},
	});
	const app = createApp(Parent);
	apps.push(app);
	app.mount(document.createElement('div'));
	return { visible, addReply };
}

describe('conversation-scoped CW controls', () => {
	test('keeps CW closed by default, including outside the controlled conversation', async () => {
		const command = ref<boolean>();
		const conversation = mountConversation(command);
		const adjacent = mountConversation();
		expect(conversation.visible[0].value).toBe(false);
		command.value = true;
		await nextTick();
		expect(conversation.visible[0].value).toBe(true);
		expect(adjacent.visible[0].value).toBe(false);
	});

	test('opens and closes all loaded replies and applies the command to later replies', async () => {
		const command = ref<boolean>();
		const conversation = mountConversation(command);
		command.value = true;
		await nextTick();
		conversation.addReply.value = true;
		await nextTick();
		expect(conversation.visible.map(state => state.value)).toEqual([true, true]);
		command.value = false;
		await nextTick();
		expect(conversation.visible.map(state => state.value)).toEqual([false, false]);
	});

	test('allows per-note changes until another bulk command is issued', async () => {
		const command = ref<boolean>(true);
		const conversation = mountConversation(command);
		conversation.visible[0].value = false;
		await nextTick();
		expect(conversation.visible[0].value).toBe(false);
		command.value = false;
		await nextTick();
		command.value = true;
		await nextTick();
		expect(conversation.visible[0].value).toBe(true);
	});
});
