import { ref } from 'vue';
import { type UploadedFileTracker, type FileUpload, DBName } from '../../types/app-types';

export function useSharedDBStore() {
  const globalDBVersion = ref(1);
  const filesUploaded = ref(new Map<string, FileUpload>() as UploadedFileTracker);
  const globalFileIsUploading = ref(false);
  const componentFileIsUploading = ref<string | undefined>(undefined);

  const checkFileNameAvailable = (fileName: string) => {
    for (const fileUpload of filesUploaded.value.values()) {
      if (fileUpload.fileName === fileName) {
        return true;
      }
    }
    return false;
  };

  const isComponentFileUploading = (componentName: string): boolean => {
    return componentName === componentFileIsUploading.value;
  };

  const isComponentDisabled = (componentName: string): boolean => {
    return filesUploaded.value.has(componentName);
  };

  const getStoreNameByComponent = (componentName: string): string => {
    const file = filesUploaded.value.get(componentName);
    return file ? file.fileName : '';
  };

  const incrementGlobalDBVersion = () => {
    globalDBVersion.value++;
    console.log('updated globalDBVersion ', globalDBVersion.value);
  };

  const addFileUploaded = (componentName: string, dbName: DBName, fileName: string) => {
    if (filesUploaded.value.has(componentName)) {
      console.warn(`Overwriting existing file for component: ${componentName}`);
    }
    incrementGlobalDBVersion();
    filesUploaded.value.set(componentName, { dbName, fileName });
  };

  const resetFilesUploadedByDBname = (dbName: DBName) => {
    const keysToDelete: string[] = [];
    filesUploaded.value.forEach((value, key) => {
      if (value.dbName === dbName) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => {
      filesUploaded.value.delete(key);
    });
    if (keysToDelete.length > 0) {
      incrementGlobalDBVersion();
    }
  };

  return {
    globalDBVersion,
    filesUploaded,
    globalFileIsUploading,
    componentFileIsUploading,
    checkFileNameAvailable,
    isComponentFileUploading,
    isComponentDisabled,
    getStoreNameByComponent,
    incrementGlobalDBVersion,
    addFileUploaded,
    resetFilesUploadedByDBname,
  };
}
