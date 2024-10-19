import { type ConsolidatedData } from './app-types';

// Define US-specific column roles
export enum USColumnRole {
  Destination = 'destName',
  DialCode = 'dialCode',
  Rate = 'rate',
  SelectRole = '' // This will represent our "Select Column Role" option
}

// Define US-specific standardized data structure
export interface USStandardizedData {
  destName: string;
  dialCode: number;
  rate: number;
}

// Define US-specific reports input structure
export interface USReportsInput {
  fileName1: string;
  fileName2: string;
  file1Data: USStandardizedData[];
  file2Data: USStandardizedData[];
}

// Define US-specific code report structure
export interface UsCodeReport {
  file1: {
    fileName: string;
    totalCodes: number;
    totalDestinations: number;
    uniqueDestinationsPercentage: number;
  };
  file2: {
    fileName: string;
    totalCodes: number;
    totalDestinations: number;
    uniqueDestinationsPercentage: number;
  };
  matchedCodes: number;
  nonMatchedCodes: number;
  matchedCodesPercentage: number;
  nonMatchedCodesPercentage: number;
}

// Define US-specific pricing report structure
export interface UsPricingReport {
  higherRatesForFile1: ConsolidatedData[];
  higherRatesForFile2: ConsolidatedData[];
  sameRates: ConsolidatedData[];
  nonMatchingCodes: NonMatchingCode[];
  fileName1: string;
  fileName2: string;
}

// Define non-matching code structure
export interface NonMatchingCode {
  dialCode: string;
  destName: string;
  rate: number;
  file: string;
}
