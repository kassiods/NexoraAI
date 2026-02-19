import { getSupabaseClient } from '@/lib/supabase-client';
import type { Comment, Post } from '@/types/post';

const mapPost = (row: any): Post => ({
  id: row.id,
  hubId: row.hub_id,
  authorId: row.author_id,
  content: row.content ?? '',
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  likes: (row.likes as string[] | null) ?? []
});

const mapComment = (row: any): Comment => ({
  id: row.id,
  postId: row.post_id,
  authorId: row.author_id,
  content: row.content ?? '',
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  likes: (row.likes as string[] | null) ?? []
});

export const postService = {
  async listByHub(hubId: string): Promise<{ posts: Post[]; comments: Comment[] }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { posts: [], comments: [] };

    const { data: posts, error: postsError } = await supabase.from('posts').select('*').eq('hub_id', hubId).order('created_at', { ascending: false });
    if (postsError) throw postsError;
    const mappedPosts = (posts ?? []).map(mapPost);

    if (mappedPosts.length === 0) return { posts: [], comments: [] };

    const postIds = mappedPosts.map((p) => p.id);
    const { data: comments, error: commentsError } = await supabase.from('comments').select('*').in('post_id', postIds).order('created_at', { ascending: false });
    if (commentsError) throw commentsError;
    const mappedComments = (comments ?? []).map(mapComment);

    return { posts: mappedPosts, comments: mappedComments };
  },

  async listFeedForUser(userHubIds: string[]): Promise<Post[]> {
    const supabase = getSupabaseClient();
    if (!supabase || userHubIds.length === 0) return [];
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .in('hub_id', userHubIds)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data ?? []).map(mapPost);
  },

  async createPost(hubId: string, authorId: string, content: string): Promise<Post> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('posts')
      .insert({ hub_id: hubId, author_id: authorId, content })
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Falha ao criar post');
    return mapPost(data);
  },

  async addComment(postId: string, authorId: string, content: string): Promise<Comment> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: authorId, content })
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Falha ao criar comentário');
    return mapComment(data);
  },

  async togglePostLike(postId: string, userId: string): Promise<Post> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data: current, error: fetchError } = await supabase.from('posts').select('likes').eq('id', postId).maybeSingle();
    if (fetchError) throw fetchError;
    const likes = (current?.likes as string[] | null) ?? [];
    const hasLike = likes.includes(userId);
    const nextLikes = hasLike ? likes.filter((id) => id !== userId) : [...likes, userId];
    const { data, error } = await supabase
      .from('posts')
      .update({ likes: nextLikes })
      .eq('id', postId)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Falha ao atualizar like');
    return mapPost(data);
  },

  async toggleCommentLike(commentId: string, userId: string): Promise<Comment> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado');
    const { data: current, error: fetchError } = await supabase.from('comments').select('likes').eq('id', commentId).maybeSingle();
    if (fetchError) throw fetchError;
    const likes = (current?.likes as string[] | null) ?? [];
    const hasLike = likes.includes(userId);
    const nextLikes = hasLike ? likes.filter((id) => id !== userId) : [...likes, userId];
    const { data, error } = await supabase
      .from('comments')
      .update({ likes: nextLikes })
      .eq('id', commentId)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Falha ao atualizar like de comentário');
    return mapComment(data);
  }
};
