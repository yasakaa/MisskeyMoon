/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as argon2 from 'argon2';
import bcrypt from 'bcryptjs';
import { describe, expect, test } from 'vitest';
import { hashPassword, verifyPassword } from '@/misc/password-hash.js';

describe('password hash compatibility', () => {
	test('new hashes use Argon2id and accept Unicode passwords without truncation', async () => {
		const password = 'あいうえお'.repeat(20);
		const hash = await hashPassword(password);
		expect(hash).toMatch(/^\$argon2id\$/);
		expect(await verifyPassword(password, hash)).toBe(true);
		expect(await verifyPassword(`${password}x`, hash)).toBe(false);
	});
	test.each([argon2.argon2id, argon2.argon2i, argon2.argon2d] as const)('accepts existing Argon2 variant %s and stored parameters', async (type) => {
		const hash = await argon2.hash('synthetic-old-password', { type, memoryCost: 8192, timeCost: 2, parallelism: 2 });
		expect(await verifyPassword('synthetic-old-password', hash)).toBe(true);
		expect(await verifyPassword('wrong-password', hash)).toBe(false);
	});
	test('keeps existing bcrypt credentials usable', async () => {
		const hash = await bcrypt.hash('synthetic-bcrypt-password', 8);
		expect(await verifyPassword('synthetic-bcrypt-password', hash)).toBe(true);
		expect(await verifyPassword('wrong-password', hash)).toBe(false);
	});
	test.each([null, undefined, '', 'unknown', '$argon2id$malformed', '$2b$malformed'])('rejects absent or malformed hashes', async (hash) => {
		expect(await verifyPassword('synthetic-password', hash)).toBe(false);
	});
	test('rejects creation of an empty password', async () => {
		await expect(hashPassword('')).rejects.toThrow('Password must not be empty');
	});
});
