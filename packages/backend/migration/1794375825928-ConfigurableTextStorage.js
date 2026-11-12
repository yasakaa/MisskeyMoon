/*
 * SPDX-FileCopyrightText: misskey-migration contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const columns = [
	['abuse_user_report', 'reporterHost', 128],
	['abuse_user_report', 'targetUserHost', 128],
	['chat_message', 'text', 4096],
	['drive_file', 'comment', 512],
	['drive_file', 'userHost', 128],
	['emoji', 'host', 128],
	['follow_request', 'followeeHost', 128],
	['follow_request', 'followerHost', 128],
	['following', 'followeeHost', 128],
	['following', 'followerHost', 128],
	['instance', 'faviconUrl', 256],
	['instance', 'host', 128],
	['instance', 'iconUrl', 256],
	['note', 'cw', 512],
	['note', 'renoteUserHost', 128],
	['note', 'replyUserHost', 128],
	['note', 'userHost', 128],
	['poll', 'userHost', 128],
	['user', 'bannerUrl', 512],
	['user', 'host', 128],
	['user_profile', 'description', 2048],
	['user_profile', 'userHost', 128],
	['user_publickey', 'keyId', 256],
	['note_draft', 'cw', 512]
];

export class ConfigurableTextStorage1794375825928 {
	name = 'ConfigurableTextStorage1794375825928';

	async up(queryRunner) {
		for (const [table, column] of columns) {
			const [existing] = await queryRunner.query('SELECT data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 AND column_name=$3', ['public', table, column]);
			if (existing?.data_type === 'text') continue;
			await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE text`);
		}
	}

	async down(queryRunner) {
		// Check every column before narrowing any. Never truncate existing content.
		for (const [table, column, length] of columns) {
			const tooLong = await queryRunner.query(`SELECT 1 FROM "${table}" WHERE char_length("${column}") > $1 LIMIT 1`, [length]);
			if (tooLong.length > 0) throw new Error('Cannot narrow text storage while over-limit data exists');
		}
		for (const [table, column, length] of columns) {
			await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE character varying(${length})`);
		}
	}
}
