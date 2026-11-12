/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { inject, ref, watch } from 'vue';
import type { InjectionKey, Ref } from 'vue';

// 投稿詳細の配下だけに共有し、隣接するタイムラインのCWには操作を波及させない。
export const conversationCwKey: InjectionKey<Readonly<Ref<boolean | undefined>>> = Symbol('conversation-cw');

export function useConversationCw(
	control = inject(conversationCwKey, undefined),
	visible: Ref<boolean> = ref(false),
) {
	if (control) {
		// undefinedは「一括操作なし」。後から読み込んだ返信にも直近の指示を適用する。
		watch(control, value => {
			if (value !== undefined) visible.value = value;
		}, { immediate: true });
	}
	return visible;
}
