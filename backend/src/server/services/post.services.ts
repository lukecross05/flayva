import { POST_PREVIEW_INFINITE_SCROLL_BATCH_SIZE } from "@/constants/posts.constants";
import postRepo from "@/server/repositories/post.repo";
import { uploadPostImages } from "@/server/services/images.services";
import { NestedServiceObject } from "@/types/api.types";
import { createNewPostSchema } from "@flayva-monorepo/shared/validation/post.validation";
import { z } from "zod";

/**
 * Create a new post
 *
 * @param ownerId - The ID of the user creating the post
 * @param newPostData - The data for the new post
 */
export const createNewPost = async (
  ownerId: string,
  newPostData: z.infer<typeof createNewPostSchema>
) => {
  // TODO: handle upload image failures
  const { successes: imageUploads } = await uploadPostImages(
    newPostData.images
  );

  const { postId, recipeId } = await postRepo.saveNewPost(ownerId, {
    imageUploads: imageUploads,
    recipe: newPostData.recipe,
  });

  return { postId, recipeId };
};

export const deletePost = async (postId: string) => {
  const isDeleted = await postRepo.deleteExistingPost(postId);

  return {
    deleted: isDeleted,
  };
};

/**
 * Get a post by its ID
 * @param postId - The ID of the post to get
 * @returns The post with the given ID
 */
export const getPostById = (postId: string) => postRepo.getPostById(postId);

/**
 * Get a list of post previews by the owner ID with infinite scroll
 * @param ownerId - The ID of the owner
 * @param cursor - The cursor for pagination
 * @return A list of post previews and the next cursor for pagination
 */
export const infiniteScrollProfilePostPreviews = async (
  ownerId: string,
  cursor: number
) => {
  const results = await postRepo.getPostPreviewsByOwnerId(ownerId, {
    limit: POST_PREVIEW_INFINITE_SCROLL_BATCH_SIZE,
    offset: cursor,
    orderBy: ({ created_at }, { desc }) => desc(created_at),
  });

  return {
    previews: results,
    nextCursor:
      results.length < POST_PREVIEW_INFINITE_SCROLL_BATCH_SIZE
        ? null
        : cursor + POST_PREVIEW_INFINITE_SCROLL_BATCH_SIZE,
  };
};

export const getPostsByOwnerId = (ownerId: string) =>
  postRepo.getPostsByOwnerId(ownerId);

/**
 * Get a feed of posts
 *
 */
export const getFeed = async () => {
  const posts = await postRepo.getRecentPosts(5);

  return posts;
};

export const interactions = {
  /**
   * Like and unlike posts
   */
  like: {
    status: async (postId: string, userId: string) => {
      const result = await postRepo.interactions.like.status(postId, userId);

      return {
        liked: !!result,
        postId,
        userId,
      };
    },
    add: async (postId: string, userId: string) => {
      const result = await postRepo.interactions.like.add(postId, userId);
      return {
        likeAdded: !!result,
        postId,
        userId,
      };
    },
    remove: async (postId: string, userId: string) => {
      const result = await postRepo.interactions.like.remove(postId, userId);
      return {
        likeRemoved: !!result,
        postId,
        userId,
      };
    },
    toggle: async (postId: string, userId: string) => {
      const { added, removed } = await postRepo.interactions.like.toggle(
        postId,
        userId
      );

      return {
        postId,
        userId,
        added: !!added,
        removed: !!removed,
      };
    },
  },
} as const satisfies NestedServiceObject;

export default {
  createNewPost,
  getPostById,
  getFeed,
  deletePost,
  infiniteScrollProfilePostPreviews,
  interactions,
};
