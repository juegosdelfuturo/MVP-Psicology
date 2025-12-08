import { ReactNode } from 'react';

export enum SubmissionStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface FeatureProps {
  title: string;
  description: string;
  icon: ReactNode;
}