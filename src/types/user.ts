export type UserProfile = {
  uid: string;
  email: string;
  username: string | null;
  displayName: string | null;
  photoURL?: string | null;
  bio?: string | null;
  area?: string | null;
  links?: {
    github?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
  };
  hubs?: string[];
};
