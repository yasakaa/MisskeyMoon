/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

process.env.NODE_ENV = 'test';

import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type { DataSource } from 'typeorm';
import { api, initTestDb, signup } from '../utils.js';
import type * as misskey from 'misskey-js';

describe('synthetic password migration compatibility', () => {
	let db: DataSource;
	let admin: misskey.entities.SignupResponse;
	beforeAll(async () => {
		db = await initTestDb(true);
		// First synthetic account is the administrator in this disposable DB.
		admin = await signup({ username: 'authroot', password: 'synthetic-root-password' });
	});
	afterAll(async () => { await db?.destroy(); });

	test('signup persists Argon2id and login rejects an incorrect password', async () => {
		const user = await signup({ username: 'authnew', password: 'synthetic-new-password' });
		const [profile] = await db.query('SELECT password FROM user_profile WHERE "userId" = $1', [user.id]);
		expect(profile.password.startsWith('$argon2id$')).toBe(true);
		const success = await api('signin-flow', { username: user.username, password: 'synthetic-new-password' });
		expect(success.status).toBe(200);
		expect(success.body.finished).toBe(true);
		const wrong = await api('signin-flow', { username: user.username, password: 'synthetic-wrong-password' });
		expect(wrong.status).not.toBe(200);
	});

	test('a legacy bcrypt account can log in, change password and use Argon2 reauthentication', async () => {
		const user = await signup({ username: 'authlegacy', password: 'synthetic-old-password' });
		const oldHash = await bcrypt.hash('synthetic-old-password', 8);
		await db.query('UPDATE user_profile SET password = $1 WHERE "userId" = $2', [oldHash, user.id]);
		const login = await api('signin-flow', { username: user.username, password: 'synthetic-old-password' });
		expect(login.status).toBe(200);
		expect(login.body.finished).toBe(true);
		const changed = await api('i/change-password', {
			currentPassword: 'synthetic-old-password', newPassword: 'synthetic-changed-password',
		}, user);
		expect(changed.status).toBe(204);
		const [profile] = await db.query('SELECT password FROM user_profile WHERE "userId" = $1', [user.id]);
		expect(profile.password.startsWith('$argon2id$')).toBe(true);
		const newLogin = await api('signin-flow', { username: user.username, password: 'synthetic-changed-password' });
		expect(newLogin.status).toBe(200);
		expect(newLogin.body.finished).toBe(true);
		const reauth = await api('i/2fa/register', { password: 'synthetic-changed-password' }, user);
		expect(reauth.status).toBe(200);
	});

	test('administrator reset persists a usable Argon2id credential', async () => {
		const user = await signup({ username: 'authreset', password: 'synthetic-before-reset' });
		const reset = await api('admin/reset-password', { userId: user.id }, admin);
		expect(reset.status).toBe(200);
		const [profile] = await db.query('SELECT password FROM user_profile WHERE "userId" = $1', [user.id]);
		expect(profile.password.startsWith('$argon2id$')).toBe(true);
		const login = await api('signin-flow', { username: user.username, password: reset.body.password });
		expect(login.status).toBe(200);
		expect(login.body.finished).toBe(true);
	});
});
