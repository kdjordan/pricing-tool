<template>
	<div class="min-w-[300px] max-w-md rounded">
		<div
			class="px-6 rounded-lg shadow-md flex flex-col items-center justify-center space-y-4 h-96"
		>
			<UploadIcon v-if="!props.disabled" class="w-8 h-8 text-primary" />
			<p class="text-muted-foreground">{{ displayMessage }}</p>
			<div
				:class="[
					'w-[95%] h-32 border-2 border-primary rounded-md flex items-center justify-center tracking-wide text-primary hover:bg-primary/80 transition-colors',
					{
						pulse: DBstore.isComponentFileUploading(
							props.componentName
						),
						fileLoaded: props.disabled,
					},
				]"
				@dragover.prevent="onDragOver"
				@drop.prevent="onDrop"
				@dragenter="onDragEnter"
				@dragleave="onDragLeave"
				@click="selectFile"
			>
				<p
					:class="{
						'text-white': DBstore.isComponentFileUploading(
							props.componentName
						),
					}"
				>
					{{ statusMessage }}
				</p>

				<input
					type="file"
					@change="handleFileUpload"
					accept=".csv"
					hidden
					:disabled="props.disabled || DBstore.globalFileIsUploading"
					ref="fileInput"
				/>
			</div>
			<DeleteButton
				v-if="DBstore.isComponentDisabled(props.componentName)"
				@click="removeFromDB"
			/>
		</div>
		<!-- Column Roles Modal -->
		<TheModal
			v-if="showModal"
			:showModal="showModal"
			:columns="columns"
			:previewData="previewData"
			:columnRoles="columnRoles"
			:startLine="startLine"
			@confirm="confirmColumnRoles"
			@cancel="cancelModal"
			:columnRoleOptions="[
				{ value: 'destName', label: 'Destination' },
				{ value: 'dialCode', label: 'Dial Code' },
				{ value: 'rate', label: 'Rate' },
			]"
		/>
	</div>
	<!-- ::{{ DBstore.getStoreNameByComponent(props.componentName) }} -->
	<!-- {{ DBstore.AZfilesUploaded.file1 }} -->
	<!-- {{ componentName }} -->
	<!-- {{ DBstore.isComponentFileUploading(props.componentName) }} -->
	<!-- {{ showModal }} -->
</template>

<script setup lang="ts">
	import TheModal from './TheModal.vue';
	import UploadIcon from './UploadIcon.vue';
	import DeleteButton from './DeleteButton.vue';
	import { ref, watch, onMounted } from 'vue';
	import useCSVProcessing from '../composables/useCsvFilesFunctions';
	import { useDBstate } from '@/stores/dbStore';

	//componenet props
	const props = defineProps<{
		typeOfComponent: string;
		DBname: string;
		componentName: string;
		disabled: boolean;
	}>();

	// Extract functions and reactive properties from useCSVProcessing composable
	const {
		file,
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
	} = useCSVProcessing();

	// Define reactive properties
	const fileInput = ref<HTMLInputElement | null>(null);
	const isDragOver = ref<boolean>(false);
	const statusMessage = ref<string>('Drag file or click to upload');
	const displayMessage = ref<string>('');

	// Set DB name and component name from props
	const DBstore = useDBstate();

	DBname.value = props.DBname;
	componentName.value = props.componentName;

	//setup displayMessage based on componentType prop
	const updateDisplayMessage = (type: string) => {
		if (type === 'owner') {
			displayMessage.value = 'Upload YOUR rates as CSV';
		} else if (type === 'client') {
			displayMessage.value = 'Upload CARRIER rates as CSV';
		} else if (type === 'complete'){
			displayMessage.value = DBstore.getStoreNameByComponent(props.componentName)
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
		[
			() => DBstore.isComponentFileUploading(props.componentName),
			() => props.disabled,
		],
		([localDBloadingVal, disabledVal]) => {
			if (localDBloadingVal) {
				statusMessage.value = 'Working on it...';
			} else if (disabledVal) {
				statusMessage.value = 'Success!';
				updateDisplayMessage('complete')
			}
		}
	);

	//if this component has a file that's uploaded make sure stausMessage and displayMessage
	//are corrrect
	if(DBstore.getStoreNameByComponent(props.componentName)) {
		updateDisplayMessage('complete')
	}
	if(props.disabled) {
		statusMessage.value = 'Success'
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement | null;
		if (target && target.files) {
			const uploadedFile = target.files[0];
			if (uploadedFile) {
				file.value = uploadedFile;
				parseCSVForPreview(uploadedFile);
			}
		}
	}

	// onMounted(() => {
	// 	console.log('mounting', props.disabled)
	// })

	function resetLocalState() {
		file.value = null;
		fileInput.value = null;
		columns.value = [];
		previewData.value = [];
		columnRoles.value = [];
		statusMessage.value = 'Drag file here or click to load.';
	}

	function onDrop(event: DragEvent) {
		const uploadedFile = event.dataTransfer?.files[0] ?? null;
		if (uploadedFile) {
			file.value = uploadedFile;
			parseCSVForPreview(uploadedFile);
		}
		isDragOver.value = false;
	}

	function onDragOver(event: DragEvent) {
		if (!DBstore.globalFileIsUploading) {
			isDragOver.value = false;
		}
	}

	function onDragEnter(event: DragEvent) {
		if (!DBstore.globalFileIsUploading) {
			isDragOver.value = true;
		}
	}

	function onDragLeave(event: DragEvent) {
		if (!DBstore.globalFileIsUploading) {
			isDragOver.value = false;
		}
	}

	async function confirmColumnRoles(event: {
		columnRoles: string[];
		startLine: number;
	}) {
		showModal.value = false;
		console.log('column roles ', columnRoles);
		columnRoles.value = event.columnRoles;
		startLine.value = event.startLine;
		await parseCSVForFullProcessing();
	}

	function cancelModal() {
		showModal.value = false;
	}

	function selectFile(): void {
		const input = fileInput.value;
		if (input) {
			input.value = '';
			input.click();
		}
	}
</script>

<style scoped>
	.fileLoaded {
		background-color: #81c784;
		color: white;
	}
	.drop-zone .absolute {
		transition: width 0.3s ease-in-out;
	}
	.drop-zone.no-hover:hover {
		border-color: inherit; /* Disable hover effect */
		cursor: not-allowed; /* Optionally change the cursor to indicate disabled state */
	}
</style>
