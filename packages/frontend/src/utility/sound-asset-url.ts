/*
 * SPDX-FileCopyrightText: misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function soundAssetUrl(name: string): string {
	// サブフォルダーの区切りは残し、#・?・%などがファイル名として届くようにする。
	return `/client-assets/sounds/${name.split('/').map(segment => encodeURIComponent(segment)).join('/')}.mp3`;
}
