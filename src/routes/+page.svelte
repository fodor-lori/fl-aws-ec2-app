<script lang="ts">
	import { onMount } from 'svelte';

	type S3File = { key: string; size: number; lastModified: string };

	let files = $state<S3File[]>([]);
	let uploading = $state(false);
	let loading = $state(true);
	let error = $state('');

	async function fetchFiles() {
		loading = true;
		const res = await fetch('/api/files');
		files = await res.json();
		loading = false;
	}

	async function upload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;

		uploading = true;
		error = '';

		const formData = new FormData();
		formData.append('file', input.files[0]);

		const res = await fetch('/api/upload', { method: 'POST', body: formData });

		if (!res.ok) error = 'Upload failed';
		else await fetchFiles();

		uploading = false;
		input.value = '';
	}

	async function deleteFile(key: string) {
		await fetch('/api/files', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key })
		});
		await fetchFiles();
	}

	function formatSize(bytes: number) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleString();
	}

	onMount(fetchFiles);
</script>

<main class="mx-auto mt-16 max-w-3xl px-6">
	<h1 class="mb-8 text-2xl font-bold">File Storage</h1>

	<!-- Upload -->
	<div class="mb-8">
		<label
			class="inline-block cursor-pointer bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800 {uploading
				? 'cursor-not-allowed opacity-50'
				: ''}"
		>
			{uploading ? 'Uploading...' : 'Upload file'}
			<input type="file" onchange={upload} disabled={uploading} class="hidden" />
		</label>
		{#if error}
			<p class="mt-2 text-sm text-red-600">{error}</p>
		{/if}
	</div>

	<!-- File list -->
	<div>
		{#if loading}
			<p class="text-sm text-gray-400">Loading...</p>
		{:else if files.length === 0}
			<p class="text-sm text-gray-400">No files yet.</p>
		{:else}
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b-2 border-black text-left">
						<th class="pb-2 font-semibold">Name</th>
						<th class="pb-2 font-semibold">Size</th>
						<th class="pb-2 font-semibold">Uploaded</th>
						<th class="pb-2"></th>
					</tr>
				</thead>
				<tbody>
					{#each files as file (file.key)}
						<tr class="border-b border-gray-200 hover:bg-gray-50">
							<td class="py-3 pr-4">{file.key}</td>
							<td class="py-3 pr-4 text-gray-500">{formatSize(file.size)}</td>
							<td class="py-3 pr-4 text-gray-500">{formatDate(file.lastModified)}</td>
							<td class="py-3">
								<button
									onclick={() => deleteFile(file.key)}
									class="border border-gray-200 px-2 py-1 text-xs text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
								>
									Delete
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</main>
