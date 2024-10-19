import { type ConsolidatedData } from './app-types';

export enum AZColumnRole {
  Destination = 'destName',
  DialCode = 'dialCode',
  Rate = 'rate',
  SelectRole = '' // This will represent our "Select Column Role" option
}

export interface AZStandardizedData {
  destName: string;
  dialCode: number;
  rate: number;
}

export interface AZReportsInput {
  fileName1: string;
  fileName2: string;
  file1Data: AZStandardizedData[];
  file2Data: AZStandardizedData[];
}

export interface AzCodeReport {
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

export interface AZCodeReport {
  fileName1: string;
  fileName2: string;
  totalCodesFile1: number;
  totalCodesFile2: number;
  totalUniqueCodes: number;
  matchedCodes: number;
  percentageMatched: number;
  nonMatchedCodes: number;
  percentageNonMatched: number;
}

export interface AzPricingReport {
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
