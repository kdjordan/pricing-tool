import { type AZStandardizedData } from './az-types';

export enum DBName {
  AZ = 'az',
  US = 'us',
  CAN = 'can'
}

export enum IndetermRateType {
  DEFAULT = 'default',
  INTER = 'inter',
  INTRA = 'intra'
}

export interface ColumnRolesEvent {
  columnRoles: string[];
  startLine: number;
  deckType: DBName.AZ | DBName.US;
  indetermRateType?: IndetermRateType;
}




export interface USStandardizedData {
  npa: number;
  nxx: number;
  interRate: number;
  intraRate: number;
  ijRate: number;
}

export type StandardizedData = AZStandardizedData | USStandardizedData;

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


export type FileUpload = {
  dbName: string;
  fileName: string;
};

export type UploadedFileTracker = Map<string, FileUpload>;

export enum PlanTier {
  FREE = 'free',
  PRO = 'pro'
}

export interface PlanFeatures {
  unlimitedUploads: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  // Add more features as needed
}


export interface UserInfo {
  email: string;
  username: string;
  planTier: PlanTier;
  lastLoggedIn: Date | null;
  // Add any other user-related fields you need
}

export interface UserState {
  info: UserInfo | null;
  currentPlan: PlanTier;
  features: PlanFeatures;
}


