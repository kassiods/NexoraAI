export type UserProfile = {
  uid: string;
  email: string;
  username: string | null;
  displayName: string | null;
  role?: 'admin' | 'user';
  photoURL?: string | null;
  bio?: string | null;
  area?: string | null;
  areas?: string[];
  links?: {
    github?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
  };
  hubs?: string[];
};
