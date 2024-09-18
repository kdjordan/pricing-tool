<template>
	<div class="flex flex-col h-full">
		<p class="mb-4 text-center uppercase text-accent">
			<span>UPLOAD </span>
			<span class="text-white">{{ highlightedWord }}</span>
			<span> RATES AS CSV</span>
		</p>
		<div class="flex-grow flex flex-col bg-background w-full rounded-lg shadow-xl p-6">
			<div 
				:class="[
					'flex-grow flex flex-col items-center justify-center w-full border border-foreground rounded-md tracking-wide text-primary transition-colors p-8',
					{
						'animate-pulse bg-success': DBstore.isComponentFileUploading(
							props.componentName
						),
						'bg-success text-background': props.disabled,
						'hover:bg-muted cursor-pointer': !props.disabled && !isDragOver,
						'cursor-not-allowed': props.disabled || DBstore.globalFileIsUploading,
						'bg-muted': isDragOver && !props.disabled, // Add this line
					},
				]"
				@dragover.prevent="onDragOver"
				@drop.prevent="onDrop"
				@dragenter.prevent="onDragEnter"
				@dragleave.prevent="onDragLeave"
				@click="selectFile"
			>
				<div class="flex flex-col items-center gap-10 py-10 text-foreground">
					<p
						:class="{
							'text-white': DBstore.isComponentFileUploading(
								props.componentName
							),
								'text-black uppercase': props.disabled
						}"
					>
						{{ props.disabled ? 'SUCCESS' : statusMessage }}
					</p>

					<UploadIcon
						v-if="!props.disabled"
						class="w-8 h-8 text-primary"
					/>
				</div>

				<input
					type="file"
					@change="handleFileUploadEvent"
					accept=".csv, .xlsx"
					hidden
					:disabled="props.disabled || DBstore.globalFileIsUploading"
					ref="fileInput"
				/>
			</div>
			<div class="h-12 mt-4 flex items-center justify-center">
				<button
					v-if="props.disabled"
					@click="dumpFile"
					class="btn btn-destructive"
				>
					Remove
				</button>
			</div>
		</div>
		<!-- Column Roles Modal -->
		<TheModal
			v-if="isModalVisible"
			:showModal="isModalVisible"
			:columns="modalColumns"
			:previewData="modalPreviewData"
			:columnRoles="modalColumnRoles"
			:startLine="modalStartLine"
			:columnRoleOptions="props.columnRoleOptions"
			@confirm="onConfirm"
			@cancel="onCancel"
			/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { AZColumnRole, USColumnRole, DBName } from '../../types/app-types';
import UploadIcon from './UploadIcon.vue';
import TheModal from './TheModal.vue';
import { useFileUpload, FileProcessor } from '../composables/useFileUpload';

// Component props
const props = defineProps<{
  typeOfComponent: string;
  DBname: DBName;
  componentName: string;
  disabled: boolean;
  columnRoleOptions: { value: AZColumnRole | USColumnRole; label: string }[];
}>();

const {
  file,
  handleFileUpload,
  resetFileState,
  showModal,
  fileProcessor,
  DBstore,
  canUseXlsx  // Add this line
} = useFileUpload(props.DBname, props.componentName);

// Instead, use fileProcessor directly
const modalColumns = computed(() => fileProcessor.columns.value);
const modalPreviewData = computed(() => fileProcessor.previewData.value);
const modalColumnRoles = computed(() => fileProcessor.columnRoles.value);
const modalStartLine = computed(() => fileProcessor.startLine.value);

const isModalVisible = computed(() => showModal.value);

// Define reactive properties
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref<boolean>(false);
const statusMessage = ref<string>('Drag file or click to upload');
const displayMessage = ref<string>('');


// Setup displayMessage based on componentType prop
const updateDisplayMessage = (type: string) => {
  if (type === 'owner') {
    displayMessage.value = 'Upload YOUR rates as CSV';
  } else if (type === 'client') {
    displayMessage.value = 'Upload CARRIER rates as CSV';
  } else if (type === 'complete') {
    displayMessage.value = DBstore.getStoreNameByComponent(props.componentName);
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
      updateDisplayMessage('complete');
    } else {
      statusMessage.value = 'Drag file or click to upload';
    }
  }
);

// Ensure statusMessage and displayMessage are correct if this component has an uploaded file
if (DBstore.getStoreNameByComponent(props.componentName)) {
  updateDisplayMessage('complete');
}

const modalStartLineValue = computed(() => {
  const line = modalStartLine.value;
  return typeof line === 'number' ? line : line.value;
});

// Near the top of your script section, after initializing canUseXlsx
console.log('Initial canUseXlsx value:', canUseXlsx.value);

// If canUseXlsx is reactive, you might want to watch it
watch(canUseXlsx, (newValue) => {
  console.log('canUseXlsx changed to:', newValue);
});

// Add this watch as well
watch(showModal, (newValue) => {
  console.log('showModal changed in UploadComponent:', newValue);
});

async function handleFileUploadEvent(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  if (target && target.files && target.files.length > 0) {
    await handleFileUpload(target.files[0]);
  }
}

async function onDrop(event: DragEvent): Promise<void> {
  event.preventDefault();
  isDragOver.value = false;
  if (!props.disabled && !DBstore.globalFileIsUploading) {
    const uploadedFile = event.dataTransfer?.files[0] ?? null;
    if (uploadedFile) {
      await handleFileUpload(uploadedFile);
    }
  }
}

function dumpFile() {
  fileProcessor.removeFromDB(); // Update this line if removeFromDB is a method of fileProcessor
  resetFileState();
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (!props.disabled && !DBstore.globalFileIsUploading) {
    isDragOver.value = true;
  }
}

function onDragEnter(event: DragEvent) {
  event.preventDefault();
  if (!props.disabled && !DBstore.globalFileIsUploading) {
    isDragOver.value = true;
  }
}

function onDragLeave(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
}

interface ColumnRolesEvent {
  columnRoles: string[];
  startLine: number;
}

async function onConfirm(data: { columnRoles: string[]; startLine: number }) {
  console.log('Confirm clicked with data:', data);
  showModal.value = false;
  
  try {
    await fileProcessor.parseFileForFullProcessing(file.value!, data.columnRoles, data.startLine);
    console.log('File processed successfully');
  } catch (error) {
    console.error('Error processing file:', error);
    // Handle error (e.g., show error message)
  } finally {
    resetFileState();
  }
}

function onCancel() {
  console.log('Cancel clicked');
  showModal.value = false;
  resetFileState();
}

function selectFile(): void {
  if (!props.disabled) {
    const input = fileInput.value;
    if (input) {
      input.value = '';
      input.click();
    }
  }
}

const highlightedWord = computed(() => {
  return props.typeOfComponent === 'owner' ? 'YOUR' : 'CARRIER';
});
</script>

<style scoped>
	.drop-zone .absolute {
		transition: width 0.3s ease-in-out;
	}
	.drop-zone.no-hover:hover {
		border-color: inherit; /* Disable hover effect */
		cursor: not-allowed; /* Optionally change the cursor to indicate disabled state */
	}
</style>