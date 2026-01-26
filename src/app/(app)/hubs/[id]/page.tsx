"use client";

import { useEffect, useState } from 'react';
import { hubService } from '@/services/hub-service';
import { postService } from '@/services/post-service';
import { moderationService } from '@/services/moderation-service';
import { useAuth } from '@/hooks/use-auth';
import type { Hub } from '@/types/hub';
import type { Post, Comment } from '@/types/post';

type HubPageProps = { params: { id: string } };

export default function HubPage({ params }: HubPageProps) {
  const { id } = params;
  const { user } = useAuth();
  const [hub, setHub] = useState<Hub | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [visiblePosts, setVisiblePosts] = useState(4);

  useEffect(() => {
    hubService.getHub(id).then(setHub);
    postService.listByHub(id).then((data) => {
      setPosts(data.posts);
      setComments(data.comments);
    });
  }, [id]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    const created = await postService.createPost(id, user.uid, content.trim());
    setPosts((prev) => [created, ...prev]);
    setContent('');
  };

  const handleComment = async (postId: string) => {
    if (!user) return;
    const value = commentDrafts[postId]?.trim();
    if (!value) return;
    const created = await postService.addComment(postId, user.uid, value);
    setComments((prev) => [created, ...prev]);
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleReport = async (postId: string) => {
    if (!user) return;
    await moderationService.reportContent(postId, 'post', 'Denúncia iniciada no hub', user.uid);
    alert('Denúncia enviada para moderação (mock).');
  };

  const commentMap = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    acc[c.postId] = acc[c.postId] ? [...acc[c.postId], c] : [c];
    return acc;
  }, {});

  if (!hub) {
    return <p className="text-sm text-[#9CA3AF]">Carregando hub...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Hub</p>
        <h1 className="text-2xl font-semibold text-white">{hub.name}</h1>
        <p className="text-sm text-[#9CA3AF]">{hub.description}</p>
      </div>

      <form
        onSubmit={handlePost}
        className="space-y-2 rounded-2xl border border-white/6 bg-[#111118] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      >
        <label className="text-sm font-medium text-[#E5E7EB]">Publicar no feed</label>
        <textarea
          className="w-full rounded-lg border border-[#26262E] bg-[#0F1117] px-3 py-2 text-sm text-[#E5E7EB] outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-900/40"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Compartilhe sua ideia ou peça feedback"
        />
        <button
          type="submit"
          disabled={!user || !content.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          Publicar (mock)
        </button>
        {!user && <p className="text-xs text-[#9CA3AF]">Faça login para postar.</p>}
      </form>

      <div className="space-y-3">
        {posts.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#111118] p-6 text-sm text-[#9CA3AF]">
            Nenhum post ainda.
          </div>
        )}
        {posts.slice(0, visiblePosts).map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-white/6 bg-[#16161D] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:scale-[1.01] hover:border-brand-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Autor: {post.authorId}</p>
                <p className="text-xs text-[#9CA3AF]">{new Date(post.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleReport(post.id)}
                className="text-[11px] text-red-200 hover:text-red-100"
              >
                Denunciar
              </button>
            </div>
            <p className="mt-2 text-sm text-[#E5E7EB]">{post.content}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-[#9CA3AF]">
              <button className="rounded-full border border-[#26262E] px-3 py-1 transition hover:border-brand-700 hover:text-white">Curtir</button>
              <button className="rounded-full border border-[#26262E] px-3 py-1 transition hover:border-brand-700 hover:text-white" onClick={() => handleComment(post.id)}>
                Comentar
              </button>
            </div>
            <div className="mt-3 space-y-2 border-t border-[#26262E] pt-3">
              <div className="flex items-center gap-2">
                <input
                  value={commentDrafts[post.id] ?? ''}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                  placeholder="Escreva um comentário"
                  className="flex-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleComment(post.id)}
                  className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-500"
                >
                  Enviar
                </button>
              </div>
              {(commentMap[post.id] ?? []).map((c) => (
                <div key={c.id} className="rounded-lg bg-[#16161D] p-2 text-xs text-[#E5E7EB]">
                  <p className="font-semibold">{c.authorId}</p>
                  <p className="text-[#9CA3AF]">{c.content}</p>
                </div>
              ))}
              {(commentMap[post.id]?.length ?? 0) === 0 && <p className="text-xs text-[#9CA3AF]">Sem comentários.</p>}
            </div>
          </article>
        ))}
        {posts.length > visiblePosts && (
          <button
            onClick={() => setVisiblePosts((prev) => Math.min(posts.length, prev + 3))}
            className="w-full rounded-full border border-white/10 bg-[#0F1117] px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-600 hover:text-brand-100"
          >
            Carregar mais
          </button>
        )}
      </div>
    </div>
  );
}
