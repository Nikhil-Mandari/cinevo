import type { Discussion, FaceOff, Review, VoteRecord } from '../types'
import { FACE_OFFS } from '../data/community'
import { db } from './db'
import { mockDelay } from './apiClient'
import { STORAGE_KEYS, createId, readJSON, writeJSON } from '../utils/storage'

const readVotes = (): Record<string, VoteRecord> =>
  readJSON<Record<string, VoteRecord>>(STORAGE_KEYS.votes, {})

const readReactions = (): Record<string, boolean> =>
  readJSON<Record<string, boolean>>(STORAGE_KEYS.reactions, {})

export interface VoteTally {
  votesA: number
  votesB: number
  total: number
  percentA: number
  percentB: number
}

export const communityService = {
  async reviewsForMovie(movieId: string): Promise<Review[]> {
    await mockDelay(90)
    const extraLikes = readReactions()
    return db
      .reviews()
      .filter((review) => review.movieId === movieId)
      .map((review) => ({
        ...review,
        likes: review.likes + (extraLikes[`review:${review.id}`] ? 1 : 0),
      }))
      .sort((a, b) => b.likes - a.likes)
  },

  async addReview(input: {
    movieId: string
    author: string
    rating: number
    title: string
    body: string
  }): Promise<Review> {
    await mockDelay(320)
    const review: Review = {
      id: createId('rv'),
      movieId: input.movieId,
      author: input.author,
      rating: input.rating,
      title: input.title,
      body: input.body,
      createdAt: new Date().toISOString(),
      verified: false,
      likes: 0,
    }
    db.saveReviews([review, ...db.reviews()])
    return review
  },

  /** Current browser's review reactions, keyed by review id without the prefix. */
  reviewReactions(): Record<string, boolean> {
    const reactions = readReactions()
    const result: Record<string, boolean> = {}
    Object.keys(reactions).forEach((key) => {
      if (key.startsWith('review:')) result[key.replace('review:', '')] = true
    })
    return result
  },

  async toggleReviewLike(reviewId: string): Promise<boolean> {
    await mockDelay(60)
    const reactions = readReactions()
    const key = `review:${reviewId}`
    const next = !reactions[key]
    if (next) reactions[key] = true
    else delete reactions[key]
    writeJSON(STORAGE_KEYS.reactions, reactions)
    return next
  },

  async discussions(): Promise<Discussion[]> {
    await mockDelay(90)
    const reactions = readReactions()
    return db
      .discussions()
      .map((discussion) => ({
        ...discussion,
        likes: discussion.likes + (reactions[`discussion:${discussion.id}`] ? 1 : 0),
      }))
      .sort((a, b) => b.likes - a.likes)
  },

  async addDiscussion(input: {
    movieId: string
    author: string
    message: string
    topic: string
  }): Promise<Discussion> {
    await mockDelay(260)
    const discussion: Discussion = {
      id: createId('dc'),
      movieId: input.movieId,
      author: input.author,
      avatarTone: '#8a3d1c',
      message: input.message,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      topic: input.topic,
    }
    db.saveDiscussions([discussion, ...db.discussions()])
    return discussion
  },

  /** Current browser's discussion reactions, keyed by discussion id. */
  discussionReactions(): Record<string, boolean> {
    const reactions = readReactions()
    const result: Record<string, boolean> = {}
    Object.keys(reactions).forEach((key) => {
      if (key.startsWith('discussion:')) result[key.replace('discussion:', '')] = true
    })
    return result
  },

  async toggleDiscussionLike(id: string): Promise<boolean> {
    await mockDelay(50)
    const reactions = readReactions()
    const key = `discussion:${id}`
    const next = !reactions[key]
    if (next) reactions[key] = true
    else delete reactions[key]
    writeJSON(STORAGE_KEYS.reactions, reactions)
    return next
  },

  getFaceOffs(): FaceOff[] {
    return FACE_OFFS
  },

  getFaceOff(id: string): FaceOff | undefined {
    return FACE_OFFS.find((faceOff) => faceOff.id === id)
  },

  getVote(faceOffId: string): VoteRecord | undefined {
    return readVotes()[faceOffId]
  },

  castVote(faceOffId: string, movieId: string): VoteRecord {
    const votes = readVotes()
    const record: VoteRecord = { faceOffId, movieId, votedAt: new Date().toISOString() }
    votes[faceOffId] = record
    writeJSON(STORAGE_KEYS.votes, votes)
    return record
  },

  clearVote(faceOffId: string): void {
    const votes = readVotes()
    delete votes[faceOffId]
    writeJSON(STORAGE_KEYS.votes, votes)
  },

  tally(faceOff: FaceOff, vote?: VoteRecord): VoteTally {
    const votedA = vote?.movieId === faceOff.movieAId
    const votedB = vote?.movieId === faceOff.movieBId
    const votesA = faceOff.baseVotesA + (votedA ? 1 : 0)
    const votesB = faceOff.baseVotesB + (votedB ? 1 : 0)
    const total = votesA + votesB
    return {
      votesA,
      votesB,
      total,
      percentA: total ? (votesA / total) * 100 : 50,
      percentB: total ? (votesB / total) * 100 : 50,
    }
  },
}
