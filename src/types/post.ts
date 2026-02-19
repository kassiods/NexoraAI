export type Post = {
  id: string;
  hubId: string;
  authorId: string;
  content: string;
  createdAt: number;
  likes: string[];
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: number;
  likes?: string[];
};
