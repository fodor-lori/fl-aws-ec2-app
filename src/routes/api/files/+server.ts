import { json } from '@sveltejs/kit';
import { s3, BUCKET } from '$lib/s3';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function GET() {
	const response = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET }));

	const files = (response.Contents ?? []).map((obj) => ({
		key: obj.Key,
		size: obj.Size,
		lastModified: obj.LastModified
	}));

	return json(files);
}

export async function DELETE({ request }) {
	const { key } = await request.json();

	await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

	return json({ success: true });
}
