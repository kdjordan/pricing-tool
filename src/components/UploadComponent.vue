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
						'hover:bg-muted cursor-pointer': !props.disabled,
            'cursor-not-allowed': props.disabled || DBstore.globalFileIsUploading
					},
				]"
				@dragover.prevent="onDragOver"
				@drop.prevent="onDrop"
				@dragenter="onDragEnter"
				@dragleave="onDragLeave"
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
					@change="handleFileUpload"
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
import { ref, watch, computed } from 'vue';
import { AZColumnRole, USColumnRole, DBName } from '../../types/app-types';
import UploadIcon from './UploadIcon.vue';
import TheModal from './TheModal.vue';
import useCSVProcessing from '../composables/useCsvFilesFunctions';
import useXLSXProcessing from '../composables/useXlsxFiles';
import { useDBstate } from '@/stores/dbStore';
import { useFeatureAccess } from '../composables/useFeatureAccess';

// Component props
const props = defineProps<{
  typeOfComponent: string;
  DBname: DBName;
  componentName: string;
  disabled: boolean;
  columnRoleOptions: { value: AZColumnRole | USColumnRole; label: string }[];
}>();

// Initialize CSV and XLSX processors
const csvProcessor = useCSVProcessing(props.DBname);
const xlsxProcessor = useXLSXProcessing(props.DBname);

// Extract common reactive properties
const {
  file,
  startLine,
  columnRoles,
  columns,
  showModal,
  previewData,
  componentName,
  removeFromDB,
} = csvProcessor;

// Set DB name and component name from props
const DBstore = useDBstate();
componentName.value = props.componentName;

// Feature access
const { canUseXlsx } = useFeatureAccess();

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

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target && target.files && target.files.length > 0) {
    const uploadedFile = target.files[0];
    if (uploadedFile) {
      file.value = uploadedFile;
      if (uploadedFile.name.endsWith('.xlsx') && canUseXlsx.value) {
        xlsxProcessor.parseXLSXForPreview(uploadedFile);
      } else {
        csvProcessor.parseCSVForPreview(uploadedFile);
      }
    }
  }
}

function dumpFile() {
  removeFromDB();
  resetLocalState();
}

function resetLocalState() {
  file.value = null;
  fileInput.value = null;
  columns.value = [];
  previewData.value = [];
  columnRoles.value = [];
  statusMessage.value = 'Drag file here or click to load.';
  updateDisplayMessage(props.typeOfComponent);
}

function onDrop(event: DragEvent) {
  const uploadedFile = event.dataTransfer?.files[0] ?? null;
  if (uploadedFile) {
    file.value = uploadedFile;
    if (uploadedFile.name.endsWith('.xlsx') && canUseXlsx.value) {
      xlsxProcessor.parseXLSXForPreview(uploadedFile);
    } else {
      csvProcessor.parseCSVForPreview(uploadedFile);
    }
  }
  isDragOver.value = false;
}

function onDragOver(event: DragEvent) {
  if (!props.disabled) {
    isDragOver.value = true;
  }
}

function onDragEnter(event: DragEvent) {
  if (!props.disabled) {
    isDragOver.value = true;
  }
}

function onDragLeave(event: DragEvent) {
  isDragOver.value = false;
}

interface ColumnRolesEvent {
  columnRoles: string[];
  startLine: number;
}

async function confirmColumnRoles(event: ColumnRolesEvent) {
  showModal.value = false;
  columnRoles.value = event.columnRoles.map(role => {
    if (props.DBname === DBName.AZ) {
      return role as AZColumnRole;
    } else {
      return role as USColumnRole;
    }
  });
  startLine.value = event.startLine;
  if (file.value?.name.endsWith('.xlsx') && canUseXlsx.value) {
    await xlsxProcessor.parseXLSXForFullProcessing();
  } else {
    await csvProcessor.parseCSVForFullProcessing();
  }
}

function cancelModal() {
  showModal.value = false;
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