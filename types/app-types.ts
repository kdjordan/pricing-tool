export enum Feature {
  XLSX_SUPPORT = 'xlsxSupport',
  ADVANCED_ANALYTICS = 'advancedAnalytics',
  BULK_PROCESSING = 'bulkProcessing',
  // Add more features as needed
}

export interface FeatureFlags {
  [Feature.XLSX_SUPPORT]: boolean;
  [Feature.ADVANCED_ANALYTICS]: boolean;
  [Feature.BULK_PROCESSING]: boolean;
  // Add more feature flags as needed
}

export enum AZColumnRole {
  Destination = 'destName',
  DialCode = 'dialCode',
  Rate = 'rate',
  SelectRole = '' // This will represent our "Select Column Role" option
}

export enum DBName {
  AZ = 'az',
  US = 'us',
  CAN = 'can'
}


export interface State {
  globalDBVersion: number;
  filesUploaded: UploadedFileTracker;
  globalFileIsUploading: boolean;
  componentFileIsUploading: string | undefined; // Allow string or undefined
}

export interface PricingReportInput {
  fileName1: string;
  fileName2: string;
  file1Data: StandardizedData[]; 
  file2Data: StandardizedData[]; 
}

export interface StandardizedData {
  destName: string;
  dialCode: number;
  rate: number;
  [key: string]: string | number; // Allow additional properties
}

export interface FileEmit {
  file: File;
  data: StandardizedData[];
}

export interface ParsedResults {
  data: string[][];
}

export interface ConsolidatedData {
  dialCode: string;
  destName: string;
  rateFile1: number;
  rateFile2: number;
  percentageDifference: number;
}


export interface ComparisonReport {
  higherRatesForFile1: ConsolidatedData[];
  higherRatesForFile2: ConsolidatedData[];
  sameRates: ConsolidatedData[];
  nonMatchingCodes: NonMatchingCode[];
  fileName1: string;
  fileName2: string;
}


export interface NonMatchingCode {
  dialCode: string;
  destName: string;
  rate: number;
  file: string;
}

export type FileUpload = {
  dbName: string;
  fileName: string;
};

export type UploadedFileTracker = Map<string, FileUpload>;

// Add the new UserProfile interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  subscriptionType: 'free' | 'paid';
  // Add any other relevant user information
}