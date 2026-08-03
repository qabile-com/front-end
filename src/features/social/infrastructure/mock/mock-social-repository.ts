// src/features/dashboard/infrastructure/mock-social-repository.ts

import type { ISocialRepository, SocialFeedFilters } from '../../domain/social-repository';
import type { Post, ActiveUser, PostComment, AchievementCard } from '../../domain/social.data';
import type { WithActionReward } from '@/features/dashboard/domain/achievement-normalizer';
import { POSTS, TRENDING_TAGS, ACTIVE_USERS } from '../../domain/social.data';
import { mockFollowedUsers } from '@/features/leaderboard/infrastructure/mock/mock-follow-repository';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockSocialRepository implements ISocialRepository {
  // In-memory posts (starts with static data, new posts get prepended)
  private posts: Post[] = [...POSTS];

  async getFeed(limit = 10, offset = 0, filters: SocialFeedFilters = {}): Promise<Post[]> {
    await delay(400);
    const q = filters.q?.trim().toLowerCase();
    const hashtag = filters.hashtag?.trim();
    const authorId = filters.authorId?.trim();
    const author = filters.author?.trim().toLowerCase();
    const followingOnly = Boolean(filters.followingOnly);

    return this.posts
      .map(withFollowState)
      .filter((post) => {
        if (q && !post.text.toLowerCase().includes(q) && !post.author.toLowerCase().includes(q)) {
          return false;
        }
        if (hashtag && !post.tags?.includes(hashtag)) return false;
        if (authorId && post.authorId !== authorId) return false;
        if (author && !post.author.toLowerCase().includes(author)) return false;
        if (followingOnly && !post.isAuthorFollowedByMe) return false;
        return true;
      })
      .slice(offset, offset + limit);
  }

  async getPost(postId: string): Promise<Post> {
    await delay(250);
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    return withFollowState({ ...post, comments: [...post.comments] });
  }

  async getPostComments(postId: string, limit = 30, offset = 0): Promise<PostComment[]> {
    await delay(180);
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    return post.comments.slice(offset, offset + limit);
  }

  async getTrendingTags(): Promise<string[]> {
    await delay(200);
    return [...TRENDING_TAGS];
  }

  async getActiveUsers(): Promise<ActiveUser[]> {
    await delay(200);
    return ACTIVE_USERS.map((user) => ({
      ...user,
      isFollowedByMe: mockFollowedUsers.has(user.id),
      followedByMe: mockFollowedUsers.has(user.id),
    }));
  }

  async likePost(postId: string): Promise<WithActionReward<Post>> {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    post.likedByMe = true;
    post.likes += 1;
    return { data: { ...post } };
  }
  async unlikePost(postId: string): Promise<Post> {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    post.likedByMe = false;
    post.likes -= 1;
    return { ...post };
  }

  async createPost(
    text: string,
    imageFile?: File | null,
    achievement?: AchievementCard | null,
  ): Promise<WithActionReward<Post>> {
    await delay(300);

    let imageUrl: string | undefined;
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    }

    const newPost: Post = {
      id: crypto.randomUUID(),
      author: 'شما',
      authorId: 'me',
      avatar: 'linear-gradient(135deg,#ff8a3d,#cc4308)',
      badge: 'عضو',
      time: 'همین الان',
      text,
      likes: 0,
      likedByMe: false,
      isPinned: false,
      comments: [],
      commentsCount: 0,
      image: imageUrl,
      hasImage: !!imageUrl,
      achievement: achievement
        ? { title: achievement.title, sub: achievement.sub, icon: achievement.icon }
        : undefined,
    };
    this.posts.unshift(newPost);
    return { data: newPost };
  }

  async addComment(postId: string, text: string): Promise<WithActionReward<PostComment>> {
    await delay(200);
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    const newComment: PostComment = {
      name: 'شما',
      text,
      time: 'همین الان',
    };
    post.comments.push(newComment);
    post.commentsCount = (post.commentsCount ?? post.comments.length - 1) + 1;
    return { data: newComment };
  }

  async followUser(userId: string): Promise<WithActionReward<ActiveUser>> {
    await delay(150);
    mockFollowedUsers.add(userId);
    return { data: this.getMockActiveUser(userId, true) };
  }

  async unfollowUser(userId: string): Promise<ActiveUser> {
    await delay(150);
    mockFollowedUsers.delete(userId);
    return this.getMockActiveUser(userId, false);
  }

  async getFollowStatus(userId: string): Promise<boolean> {
    await delay(100);
    return mockFollowedUsers.has(userId);
  }

  private getMockActiveUser(userId: string, followed: boolean): ActiveUser {
    const user = ACTIVE_USERS.find((item) => item.id === userId);
    return {
      id: userId,
      name: user?.name ?? 'کاربر قبیله',
      role: user?.role ?? '',
      avatar: user?.avatar ?? 'linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)',
      isAdam: user?.isAdam,
      canFollow: user?.canFollow,
      isFollowedByMe: followed,
      followedByMe: followed,
    };
  }
}

function withFollowState(post: Post): Post {
  return {
    ...post,
    isAuthorFollowedByMe: mockFollowedUsers.has(post.authorId),
    commentsCount: post.commentsCount ?? post.comments.length,
  };
}
