import { mockComments, mockPosts } from '@/data/mock/posts';
import type { Comment, Post } from '@/types/post';

export const postService = {
  async listByHub(hubId: string): Promise<{ posts: Post[]; comments: Comment[] }> {
    return {
      posts: mockPosts.filter((p) => p.hubId === hubId).sort((a, b) => b.createdAt - a.createdAt),
      comments: mockComments.filter((c) => mockPosts.some((p) => p.id === c.postId && p.hubId === hubId))
    };
  },

  async listFeedForUser(userHubIds: string[]): Promise<Post[]> {
    return mockPosts
      .filter((p) => userHubIds.includes(p.hubId))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  },

  async createPost(hubId: string, authorId: string, content: string): Promise<Post> {
    const post: Post = {
      id: `post-${Date.now()}`,
      hubId,
      authorId,
      content,
      createdAt: Date.now(),
      likes: []
    };
    mockPosts.unshift(post);
    return post;
  },

  async addComment(postId: string, authorId: string, content: string): Promise<Comment> {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId,
      content,
      createdAt: Date.now()
    };
    mockComments.unshift(comment);
    return comment;
  }
};
