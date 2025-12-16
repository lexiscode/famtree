import { PageProps } from '@inertiajs/inertia';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface ProfileCompletionField {
  key: string;
  label: string;
}

export interface ProfileCompletion {
  percentage: number;
  completed_count: number;
  total_count: number;
  completed_fields: ProfileCompletionField[];
  missing_fields: ProfileCompletionField[];
}

interface CustomPageProps extends PageProps {
  auth?: {
    user?: AuthUser;
  };
}
