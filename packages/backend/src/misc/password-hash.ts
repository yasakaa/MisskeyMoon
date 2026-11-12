/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as argon2 from 'argon2';
import bcrypt from 'bcryptjs';

/** 移行元のハッシュは変更せず照合する。既存bcryptとSharkeyのArgon2を両方受け入れる。 */
export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
	if (!hash) return false;
	try {
		if (/^\$argon2(?:id|i|d)\$/.test(hash)) {
			return await argon2.verify(hash, password);
		}
		if (/^\$2[aby]\$/.test(hash)) {
			return await bcrypt.compare(password, hash);
		}
		return false;
	} catch {
		// 壊れたハッシュは認証失敗にする。パスワードやハッシュをログへ出さない。
		return false;
	}
}

export async function hashPassword(password: string): Promise<string> {
	// 新規登録・変更時はArgon2idに統一する。ログインだけでは既存ハッシュを書き換えない。
	if (password.length === 0) throw new Error('Password must not be empty');
	return argon2.hash(password, {
		type: argon2.argon2id,
		memoryCost: 65536,
		timeCost: 3,
		parallelism: 1,
	});
}
