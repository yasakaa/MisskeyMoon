/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

process.env.NODE_ENV = 'test';

import { beforeAll, describe, expect, test } from 'vitest';
import { loadConfig } from '@/config.js';
import { api, signup, uploadFile } from '../utils.js';
import type * as misskey from 'misskey-js';

describe('configured text limits over HTTP', () => {
	const limits = loadConfig();
	let user: misskey.entities.SignupResponse;
	beforeAll(async () => { user = await signup({ username: 'limituser' }); });
	test('advertises the same local limits used by API validation', async () => {
		const result = await api('meta', {});
		expect(result.body.maxNoteTextLength).toBe(limits.maxNoteLength);
		expect(result.body.maxCwTextLength).toBe(limits.maxCwLength);
		expect(result.body.maxAltTextLength).toBe(limits.maxAltTextLength);
		expect(result.body.maxBioLength).toBe(limits.maxBioLength);
	});
	test('preserves a note and CW at the configured limit and rejects overflow', async () => {
		const text = 'あ'.repeat(limits.maxNoteLength);
		const cw = '警'.repeat(limits.maxCwLength);
		const accepted = await api('notes/create', { text, cw }, user);
		expect(accepted.status).toBe(200);
		expect(accepted.body.createdNote.text === text).toBe(true);
		expect(accepted.body.createdNote.cw === cw).toBe(true);
		expect((await api('notes/create', { text: `${text}あ` }, user)).status).toBe(400);
		expect((await api('notes/create', { text: 'synthetic', cw: `${cw}警` }, user)).status).toBe(400);
	});
	test('counts non-BMP Unicode characters consistently without truncation', async () => {
		const text = '😀'.repeat(limits.maxNoteLength);
		const accepted = await api('notes/create', { text }, user);
		expect(accepted.status).toBe(200);
		expect(accepted.body.createdNote.text === text).toBe(true);
	});
	test('validates profile and image descriptions against their own limits', async () => {
		const description = '紹'.repeat(limits.maxBioLength);
		expect((await api('i/update', { description }, user)).status).toBe(200);
		expect((await api('i/update', { description: `${description}紹` }, user)).status).toBe(400);
		const uploaded = await uploadFile(user);
		expect(uploaded.status).toBe(200);
		const comment = '画'.repeat(limits.maxAltTextLength);
		const accepted = await api('drive/files/update', { fileId: uploaded.body!.id, comment }, user);
		expect(accepted.status).toBe(200);
		expect(accepted.body.comment === comment).toBe(true);
		expect((await api('drive/files/update', { fileId: uploaded.body!.id, comment: `${comment}画` }, user)).status).toBe(400);
	});
	test('drafts accept the same CW limit as notes', async () => {
		const cw = '下'.repeat(limits.maxCwLength);
		const accepted = await api('notes/drafts/create', { text: 'synthetic-draft', cw }, user);
		expect(accepted.status).toBe(200);
		expect((await api('notes/drafts/create', { text: 'synthetic-draft', cw: `${cw}下` }, user)).status).toBe(400);
	});
});
