<template>
	<div
		class="px-6 rounded-lg shadow-xl flex flex-col items-center justify-between bg-background w-full py-8"
	>
		<div
			:class="[
				'border border-mutedForeground rounded-md flex items-center justify-center tracking-wide text-primary hover:bg-muted transition-colors cursor-pointer w-full',
				{
					pulse: isUploading,
					fileLoaded: isFileUploaded,
				},
			]"
			@dragover.prevent="onDragOver"
			@drop.prevent="onDrop"
			@dragenter="onDragEnter"
			@dragleave="onDragLeave"
			@click="selectFile"
		>
			<div
				class="flex flex-col items-center gap-10 py-10 text-foreground"
			>
				<p :class="{ 'text-white': isUploading }">
					{{ statusMessage }}
				</p>
				<UploadIcon
					v-if="!isFileUploaded"
					class="w-8 h-8 text-primary"
				/>
				<p
					v-if="isFileUploaded"
					class="text-sm text-muted-foreground"
				>
					{{ uploadedFileName }}
				</p>
				<progress
					v-if="isUploading"
					:value="uploadProgress"
					max="100"
				></progress>
			</div>
			<input
				type="file"
				@change="handleFileUpload"
				accept=".csv"
				hidden
				:disabled="isFileUploaded"
				ref="fileInput"
			/>
		</div>
		<button
			v-if="isFileUploaded"
			@click="removeFile"
			class="btn btn-destructive mt-4"
		>
			Remove File
		</button>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue';
	import UploadIcon from './UploadIcon.vue';

	const props = defineProps<{
		isUploading: boolean;
		isFileUploaded: boolean;
		uploadedFileName: string;
		uploadProgress: number;
		statusMessage: string;
	}>();

	const emit = defineEmits<{
		(e: 'fileSelected', file: File): void;
		(e: 'fileDropped', file: File): void;
		(e: 'removeFile'): void;
	}>();

	const fileInput = ref<HTMLInputElement | null>(null);
	const isDragOver = ref(false);

	function onDrop(event: DragEvent) {
		const uploadedFile = event.dataTransfer?.files[0];
		if (uploadedFile) {
			emit('fileDropped', uploadedFile);
		}
		isDragOver.value = false;
	}

	function onDragOver() {
		if (!props.isFileUploaded) {
			isDragOver.value = true;
		}
	}

	function onDragEnter() {
		if (!props.isFileUploaded) {
			isDragOver.value = true;
		}
	}

	function onDragLeave() {
		if (!props.isFileUploaded) {
			isDragOver.value = false;
		}
	}

	function selectFile() {
		if (!props.isFileUploaded && fileInput.value) {
			fileInput.value.click();
		}
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const uploadedFile = target.files?.[0];
		if (uploadedFile) {
			emit('fileSelected', uploadedFile);
		}
	}

	function removeFile() {
		emit('removeFile');
	}
</script>