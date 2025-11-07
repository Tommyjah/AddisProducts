export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'regular' | 'government' | 'admin';
  bio?: string;
  github?: string;
  twitter?: string;
  website?: string;
  joinedAt: Date;
}

export interface Product {
  id: string;
  title: string;
  titleAm?: string;
  description: string;
  descriptionAm?: string;
  image: string;
  website?: string;
  github?: string;
  category: string;
  tags: string[];
  votes: number;
  rating: number;
  reviewCount: number;
  userId: string;
  user: User;
  createdAt: Date;
  isFeatured: boolean;
  fundingGoal?: number;
  currentFunding?: number;
  collaborators: User[];
  status: 'active' | 'funding' | 'completed';
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  user: User;
  productId: string;
  createdAt: Date;
  helpful: number;
}

export interface Vote {
  id: string;
  userId: string;
  productId: string;
  type: 'up' | 'down';
  createdAt: Date;
}

export interface GovernmentProposal {
  id: string;
  title: string;
  titleAm?: string;
  description: string;
  descriptionAm?: string;
  budget: number;
  timeline: string;
  requirements: string[];
  userId: string;
  user: User;
  status: 'submitted' | 'under_review' | 'accepted' | 'declined';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  user: User;
  productId: string;
  createdAt: Date;
  replies?: Comment[];
}

export type Language = 'en' | 'am';