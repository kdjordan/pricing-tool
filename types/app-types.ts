export interface StandardizedData {
  destName: string;
  dialCode: string;
  rate: number;
}

export interface FileEmit {
  file: File;
  data: StandardizedData[];
}

export interface ParsedResults {
  data: string[][];
}


export interface RateComparison {
  dialCode: string;
  destName: string;
  rateFile1: number;
  rateFile2: number;
  percentageDifference: number;
}

export interface ComparisonReport {
  higherRatesForFile1: RateComparison[];
  higherRatesForFile2: RateComparison[];
  sameRates: { [dialCode: string]: { destName: string; rateFile1: number; rateFile2: number } };
}

export interface NonMatchingCode {
  dialCode: string;
  destName: string;
  rate: number;
  file: 'file1' | 'file2';
}

export interface UploadedFileTracker {
  file1: string;
  file2: string;
  fileCount: number;
}
