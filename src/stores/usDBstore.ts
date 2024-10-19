import { type UploadedFileTracker, type FileUpload, DBName} from '../../types/app-types';
import { type UsPricingReport, type UsCodeReport } from '../../types/us-types';
import { defineStore } from 'pinia'

// Define the report state map
const ReportState = {
  FILES: 'files',
  CODE: 'code',
  PRICING: 'pricing',
} as const;

type ReportStateType = typeof ReportState[keyof typeof ReportState];

export const useDBstate = defineStore('usStore', {
  state: () => ({
    filesUploaded: new Map<string, FileUpload>() as UploadedFileTracker,
    
    componentFileIsUploading: undefined as string | undefined,
    showUsUploadComponents: true,
    usReportsGenerated: false,
    usPricingReport: null as UsPricingReport | null,
    usCodeReport: null as UsCodeReport | null,
    activeReportUS: ReportState.FILES as ReportStateType,
  }),
  
  getters: {
    checkFileNameAvailable: (state) => {
      return (fileName: string) => {
        for (const fileUpload of state.filesUploaded.values()) {
          if (fileUpload.fileName === fileName) {
            return true;
          }
        }
        return false;
      };
    },
    isComponentFileUploading: (state) => (componentName: string): boolean => {
      return componentName === state.componentFileIsUploading
    },
    isComponentDisabled: (state) => (componentName: string): boolean => {
      for (const [key,] of state.filesUploaded) {
        if (key === componentName) {
          return true;
        }
      }
      return false;
    },
    getStoreNameByComponent: (state) => (componentName: string): string => {
      for (const [key, value] of state.filesUploaded) {
        if (key === componentName) {
          return value.fileName
        }
      }
      return '';
    },
    getIsUSfull: (state) => {
      let count = 0;
      for (const file of state.filesUploaded.values()) {
        if (file.dbName === 'us') {
          count++;
          if (count === 2) return true;
        }
      }
      return false;
    },
    getUSFileNames(): string[] {
      return this.getFileNamesForDB(DBName.US);
    },
    getFileCountForDB: (state) => (dbName: DBName) => {
      return Array.from(state.filesUploaded.values()).filter(file => file.dbName === dbName).length;
    },
    getFileNamesForDB: (state) => (dbName: DBName) => {
      return Array.from(state.filesUploaded.values())
        .filter(file => file.dbName === dbName)
        .map(file => file.fileName);
    },
    getAllUploadedFiles: (state) => {
      return Array.from(state.filesUploaded.entries()).map(([componentName, file]) => ({
        componentName,
        dbName: file.dbName,
        fileName: file.fileName
      }));
    },
    getUsReportsGenerated: (state) => state.usReportsGenerated,
    getUsPricingReport: (state) => state.usPricingReport,
    getUsCodeReport: (state) => state.usCodeReport,
    getActiveReportUS: (state) => state.activeReportUS,
  },
  actions: {
    async resetUsReportInStore() {
      try {
        console.log('Resetting the US report');
        this.resetFilesUploadedByDBname(DBName.US);
        this.usReportsGenerated = false;
        this.usPricingReport = null;
        this.usCodeReport = null;
        this.showUsUploadComponents = true;
        console.log('US reports and uploaded files reset successfully');
      } catch (error) {
        console.error('Error resetting US reports:', error);
      }
    },
    removeFileNameFilesUploaded(fileName: string) {
      let fileRemoved = false;
      for (const [key, value] of this.filesUploaded) {
        if (value.fileName === fileName) {
          this.filesUploaded.delete(key);
          fileRemoved = true;
          break;
        }
      }
      if (fileRemoved) {
        this.incrementGlobalDBVersion();
      } else {
        console.warn(`File not found for removal: ${fileName}`);
      }
    },
    setComponentFileIsUploading(componentName: string | undefined) {
      this.componentFileIsUploading = componentName;
    },
    setGlobalFileIsUploading(isUploading: boolean) {
      this.globalFileIsUploading = isUploading;
    },

    addFileUploaded(componentName: string, dbName: DBName, fileName: string) {
      if (this.filesUploaded.has(componentName)) {
        console.warn(`Overwriting existing file for component: ${componentName}`);
      }
      this.incrementGlobalDBVersion();
      this.filesUploaded.set(componentName, { dbName, fileName });
    },
    resetFilesUploadedByDBname(dbName: DBName) {
      const keysToDelete: string[] = [];
      this.filesUploaded.forEach((value, key) => {
        if (value.dbName === dbName) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => {
        this.filesUploaded.delete(key);
      });
      if (keysToDelete.length > 0) {
        this.incrementGlobalDBVersion();
      }
    },
    setShowUsUploadComponents(show: boolean) {
      this.showUsUploadComponents = show;
    },
    setReportsGenerated(generated: boolean) {
      this.usReportsGenerated = generated;
    },
    setUsPricingReport(report: UsPricingReport | null) {
      this.usPricingReport = report;
    },
    setUsCodeReport(report: UsCodeReport | null) {
      this.usCodeReport = report;
    },
    resetUsReports() {
      this.usReportsGenerated = false;
      this.usPricingReport = null;
      this.usCodeReport = null;
    },
    setActiveReportUS(report: ReportStateType) {
      this.activeReportUS = report;
    },
  },
})