import { ForumPost } from '../models/mongoModels';
import { moderateAndPossiblySuspend } from './contentModeration.service';

export async function createForumPost(
  userId: string,
  userName: string,
  data: { title: string; content: string; category: string; tags?: string[] }
) {
  const post = new ForumPost({
    userId,
    userName,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags || []
  });

  const saved = await post.save();

  const moderation = await moderateAndPossiblySuspend(
    data.content,
    userId,
    userName,
    'forum_post',
    saved.id
  );

  if (!moderation.isAppropriate && moderation.action === 'content_removed') {
    await ForumPost.findByIdAndDelete(saved.id);
    throw new Error('Post removed by moderation');
  }

  if (!moderation.isAppropriate) {
    saved.isModerated = true;
    saved.moderationFlags = moderation.flags;
    await saved.save();
  }

  return saved;
}

export async function listForumPosts() {
  return ForumPost.find().sort({ createdAt: -1 }).limit(100).lean();
}

export async function getForumPost(id: string) {
  const post = await ForumPost.findById(id).lean();
  if (!post) throw new Error('Post not found');
  return post;
}
