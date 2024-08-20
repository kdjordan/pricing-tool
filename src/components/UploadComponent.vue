<template>
	<div class="rounded-lg">
		<p class="mb-8 text-center uppercase text-accent">
			{{ displayMessage }}
		</p>
		<FileUploadZone
			:disabled="props.disabled || isUploading"
			:is-uploading="isUploading"
			:is-file-uploaded="!!file"
			:uploaded-file-name="file?.name || ''"
			:upload-progress="uploadProgress"
			:status-message="statusMessage"
			@file-selected="handleFileSelected"
			@file-dropped="handleFileSelected"
			@remove-file="handleRemoveFile"
		/>
		<TheModal
			v-show="showModal"
			:showModal="showModal"
			:columns="columns"
			:previewData="previewData"
			:columnRoles="columnRoles"
			:startLine="startLine"
			@confirm="confirmColumnRoles"
			@cancel="cancelModal"
			:columnRoleOptions="columnRoleOptions"
		/>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, computed, defineEmits } from 'vue';
	import TheModal from './TheModal.vue';
	import FileUploadZone from './FileUploadZone.vue';
	import { AZColumnRole } from '../../types/app-types';
	import useCSVProcessing from '@/composables/useCsvFilesFunctions';
	import { useDBstate } from '@/stores/dbStore';
	import useFileUpload from '@/composables/useFileUpload';
	import useIndexedDB from '@/composables/useIndexDB';

	// Extract the uploadFile function from the useFileUpload composable
	const { uploadFile } = useFileUpload();

	// Component props
	const props = defineProps<{
		typeOfComponent: string;
		DBname: string;
		componentName: string;
		disabled: boolean;
		columnRoleOptions: { value: AZColumnRole; label: string }[];
	}>();

	// Extract functions and reactive properties from useCSVProcessing composable
	const {
		startLine,
		columnRoles,
		columns,
		DBname,
		showModal,
		previewData,
		componentName,
		parseCSVForFullProcessing,
		parseCSVForPreview,
		removeFromDB,
		setFile,
	} = useCSVProcessing();

	// Define reactive properties
	const displayMessage = ref<string>('');

	// Set DB name and component name from props
	const DBstore = useDBstate();

	DBname.value = props.DBname;
	componentName.value = props.componentName;

	// Setup displayMessage based on componentType prop
	const updateDisplayMessage = (type: string) => {
		if (type === 'owner') {
			displayMessage.value = 'Upload YOUR rates as CSV';
		} else if (type === 'client') {
			displayMessage.value = 'Upload CARRIER rates as CSV';
		} else if (type === 'complete') {
			displayMessage.value = DBstore.getStoreNameByComponent(
				props.componentName
			);
		}
	};

	// Watch for changes in typeOfComponent prop
	watch(
		() => props.typeOfComponent,
		(newType) => {
			updateDisplayMessage(newType);
		},
		{ immediate: true }
	);

	// Watch for changes in fileUploading and disabled prop
	watch(
		() => props.disabled,
		(disabledVal) => {
			if (disabledVal) {
				statusMessage.value = 'Success';
				updateDisplayMessage('complete');
			} else {
				statusMessage.value = 'Drag file here or click to load.';
			}
		}
	);

	// Ensure statusMessage and displayMessage are correct if this component has an uploaded file
	if (DBstore.getStoreNameByComponent(props.componentName)) {
		updateDisplayMessage('complete');
	}

	const file = ref<File | null>(null);

	function handleFileSelected(uploadedFile: File) {
		file.value = uploadedFile;
		setFile(uploadedFile);
		parseCSVForPreview(uploadedFile);
	}

	function resetComponentState() {
		columns.value = [];
		previewData.value = [];
		columnRoles.value = [];
		statusMessage.value = 'Drag file here or click to load.';
	}

	interface ColumnRolesEvent {
		columnRoles: string[];
		startLine: number;
	}

	async function confirmColumnRoles(event: ColumnRolesEvent) {
		showModal.value = false;
		columnRoles.value = event.columnRoles;
		startLine.value = event.startLine;
		await parseCSVForFullProcessing();
	}

	function cancelModal() {
		showModal.value = false;
	}

	// New reactive properties for file upload state
	const isUploading = ref(false);
	const isFileUploaded = ref(false);
	const uploadProgress = ref(0);
	const uploadedFileName = ref('');

	// New ref for status message
	const statusMessage = ref(
		'Drag and drop your CSV file here, or click to select'
	);

	// New function to handle file upload
	async function handleFileUpload(file: File) {
		isUploading.value = true;
		statusMessage.value = 'Uploading...';
		uploadProgress.value = 0;

		try {
			await uploadFile(file, (progress: number) => {
				uploadProgress.value = progress;
			});

			uploadedFileName.value = file.name;
			isFileUploaded.value = true;
			emit('fileUploaded', {
				componentName: props.componentName,
				fileName: file.name,
			});
		} catch (error) {
			console.error('File upload failed:', error);
			emit('uploadError', {
				componentName: props.componentName,
				error,
			});
		} finally {
			isUploading.value = false;
		}
	}

	const emit = defineEmits<{
		(
			e: 'fileUploaded',
			payload: { componentName: string; fileName: string }
		): void;
		(
			e: 'uploadError',
			payload: { componentName: string; error: unknown }
		): void;
		(e: 'fileRemoved', componentName: string): void;
	}>();

	const { deleteObjectStore } = useIndexedDB();

	async function handleRemoveFile() {
		if (file.value) {
			try {
				// Remove from IndexedDB
				await deleteObjectStore(DBname.value, file.value.name);

				// Remove from Pinia store
				DBstore.removeFileNameFilesUploaded(file.value.name);

				// Reset component state
				resetComponentState();

				// Emit event to parent component
				emit('fileRemoved', props.componentName);
			} catch (error) {
				console.error('Error removing file:', error);
				// Handle error (e.g., show error message to user)
			}
		}
	}
</script>

<style scoped>
	.fileLoaded {
		background-color: hsl(120, 80%, 50%);
		color: black;
	}
</style>