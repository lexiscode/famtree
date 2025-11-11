import { PageProps } from '@inertiajs/inertia';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface CustomPageProps extends PageProps {
  auth?: {
    user?: AuthUser;
  };
}
