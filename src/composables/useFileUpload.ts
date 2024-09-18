import { ref, Ref } from 'vue';
import { useDBstate } from '@/stores/dbStore';
import useCSVProcessing from './useCsvFilesFunctions';
import useXLSXProcessing  from './useXlsxFiles';
import { useFeatureAccess } from './useFeatureAccess';
import { DBName } from '../../types/app-types';

export interface FileProcessor {
  columns: Ref<string[]>;
  previewData: Ref<string[][]>;
  columnRoles: Ref<string[]>;
  startLine: Ref<number>;
  parseFileForPreview: (uploadedFile: File) => Promise<void>;
  parseFileForFullProcessing: (uploadedFile: File, columnRoles: string[], startLine: number) => Promise<void>;
  removeFromDB: () => void;
}

export function useFileUpload(dbName: DBName, componentName: string) {
  const file = ref<File | null>(null);
  const DBstore = useDBstate();
  const csvProcessor = useCSVProcessing(dbName);
  const xlsxProcessor = useXLSXProcessing(dbName);
  const { canUseXlsx } = useFeatureAccess();
  const showModal = ref(false);

  const fileProcessor: FileProcessor = {
    columns: ref<string[]>([]),
    previewData: ref<string[][]>([]),
    columnRoles: ref<string[]>([]),
    startLine: ref<number>(1),
    async parseFileForPreview(uploadedFile: File) {
      if (uploadedFile.name.toLowerCase().endsWith('.xlsx') && canUseXlsx.value) {
        await xlsxProcessor.parseXLSXForPreview(uploadedFile);
        this.columns.value = xlsxProcessor.columns.value;
        this.previewData.value = xlsxProcessor.previewData.value;
        this.columnRoles.value = xlsxProcessor.columnRoles.value;
        this.startLine.value = xlsxProcessor.startLine.value;
      } else {
        await csvProcessor.parseCSVForPreview(uploadedFile);
        this.columns.value = csvProcessor.columns.value;
        this.previewData.value = csvProcessor.previewData.value;
        this.columnRoles.value = csvProcessor.columnRoles.value;
        this.startLine.value = csvProcessor.startLine.value;
      }
    },
    async parseFileForFullProcessing(uploadedFile: File, columnRoles: string[], startLine: number) {
      if (uploadedFile.name.toLowerCase().endsWith('.xlsx') && canUseXlsx.value) {
        await xlsxProcessor.parseXLSXForFullProcessing(uploadedFile, columnRoles, startLine);
      } else {
        await csvProcessor.parseCSVForFullProcessing(uploadedFile, columnRoles, startLine);
      }
    },
    removeFromDB() {
      // Implement the logic to remove the file from the database
      // This might involve calling methods from csvProcessor or xlsxProcessor
      // depending on the file type
      if (file.value?.name.toLowerCase().endsWith('.xlsx') && canUseXlsx.value) {
        xlsxProcessor.removeFromDB();
      } else {
        csvProcessor.removeFromDB();
      }
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    file.value = uploadedFile;
    console.log('File uploaded:', file.value.name);
    try {
      await fileProcessor.parseFileForPreview(file.value);
      showModal.value = true;
    } catch (error) {
      console.error('Error processing file:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const resetFileState = () => {
    file.value = null;
    fileProcessor.columns.value = [];
    fileProcessor.previewData.value = [];
    fileProcessor.columnRoles.value = [];
    fileProcessor.startLine.value = 1;
  };

  return {
    file,
    handleFileUpload,
    resetFileState,
    showModal,
    fileProcessor,
    DBstore,
    canUseXlsx  // Add this line
  };
}