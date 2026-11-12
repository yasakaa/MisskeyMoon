/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

process.env.NODE_ENV = 'test';

import { beforeAll, describe, expect, test } from 'vitest';
import { api, signup, uploadFile } from '../utils.js';
import type * as misskey from 'misskey-js';

describe('drive filename and description search', () => {
	let owner: misskey.entities.SignupResponse;
	let stranger: misskey.entities.SignupResponse;
	let filename: string;
	let description: string;
	let special: string;
	let nested: string;
	let folderId: string;

	beforeAll(async () => {
		owner = await signup({ username: 'driveowner' });
		stranger = await signup({ username: 'driveother' });
		expect(typeof owner.token).toBe('string');
		expect(typeof stranger.token).toBe('string');
		const a = await uploadFile(owner, { name: 'Needle-image.jpg' });
		const b = await uploadFile(owner, { name: 'description-only.jpg' });
		const c = await uploadFile(owner, { name: 'literal-special.jpg' });
		const d = await uploadFile(owner, { name: 'nested-needle.jpg' });
		const foreign = await uploadFile(stranger, { name: 'Needle-foreign.jpg' });
		for (const [index, result] of [a, b, c, d, foreign].entries()) expect(result.status, `synthetic upload ${index}`).toBe(200);
		filename = a.body!.id;
		description = b.body!.id;
		special = c.body!.id;
		nested = d.body!.id;
		expect((await api('drive/files/update', { fileId: special, comment: 'Literal % _ \\ characters' }, owner)).status).toBe(200);
		expect((await api('drive/files/update', { fileId: description, comment: 'A NEEDLE in the description' }, owner)).status).toBe(200);
		expect((await api('drive/files/update', { fileId: foreign.body!.id, comment: 'needle' }, stranger)).status).toBe(200);
		const folder = await api('drive/folders/create', { name: 'search-folder' }, owner);
		expect(folder.status).toBe(200);
		folderId = folder.body.id;
		expect((await api('drive/files/update', { fileId: nested, folderId }, owner)).status).toBe(200);
	}, 120000);

	test('matches names or descriptions case-insensitively and keeps ownership and folder constraints', async () => {
		const result = await api('drive/files', { searchQuery: 'nEeDlE' }, owner);
		expect(result.status).toBe(200);
		expect(result.body.map(file => file.id).sort()).toEqual([filename, description].sort());
		const inFolder = await api('drive/files', { searchQuery: 'needle', folderId }, owner);
		expect(inFolder.status).toBe(200);
		expect(inFolder.body.map(file => file.id)).toEqual([nested]);
	});

	test('treats SQL wildcard characters literally', async () => {
		for (const searchQuery of ['%', '_', '\\']) {
			const result = await api('drive/files', { searchQuery }, owner);
			expect(result.status).toBe(200);
			expect(result.body.map(file => file.id)).toEqual([special]);
		}
	});

	test('preserves MIME filtering and normal listing for blank queries', async () => {
		expect((await api('drive/files', { searchQuery: 'needle', type: 'video/*' }, owner)).body).toEqual([]);
		expect((await api('drive/files', { searchQuery: 'needle', type: 'image/*' }, owner)).body).toHaveLength(2);
		expect((await api('drive/files', { searchQuery: '  ' }, owner)).body).toHaveLength(3);
		expect((await api('drive/files', { searchQuery: ' needle ', limit: 1 }, owner)).body).toHaveLength(1);
	});

	test('requires authentication and validates query length', async () => {
		expect((await api('drive/files', { searchQuery: 'needle' })).status).toBe(401);
		expect((await api('drive/files', { searchQuery: 'x'.repeat(1001) }, owner)).status).toBe(400);
	});
});
