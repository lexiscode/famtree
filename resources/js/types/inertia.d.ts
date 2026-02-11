import { PageProps } from '@inertiajs/inertia';

export interface AuthUser {
  id: number;
  uuid: string;
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

export interface OrgAuth {
  id: number;
  uuid: string;
  username: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'moderator';
  display_name: string | null;
  organization: {
    id: number;
    name: string;
    short_name: string;
    slug: string;
    logo_url: string | null;
  } | null;
}

interface CustomPageProps extends PageProps {
  auth?: {
    user?: AuthUser;
    org?: OrgAuth;
  };
}
