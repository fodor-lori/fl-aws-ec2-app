import { json } from '@sveltejs/kit';
import { s3, BUCKET } from '$lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST({ request }) {
	const formData = await request.formData();
	const file = formData.get('file') as File;

	if (!file) return json({ error: 'No file provided' }, { status: 400 });

	const buffer = Buffer.from(await file.arrayBuffer());

	await s3.send(
		new PutObjectCommand({
			Bucket: BUCKET,
			Key: file.name,
			Body: buffer,
			ContentType: file.type
		})
	);

	return json({ success: true });
}
