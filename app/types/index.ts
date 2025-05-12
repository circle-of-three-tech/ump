export interface User {
   
  // Social relationships
  // followers          User[]    @relation("UserFollows")
  // following          User[]    @relation("UserFollows")
  
  // // Listings and reviews
  // listings           listing[]
  // reviews_received   Review[]  @relation("ReviewsReceived")
  // reviews_given      Review[]  @relation("ReviewsGiven")
   
  id: string;
  name: string;
  image: string;
  university: string;
  bio: string;
  email: string;
  interests: string[];
  student_id_image: string;
  profile_image: string;
  verification_status: string;
  profile_completed: boolean;
  is_verified: boolean;
  followers: object[];
  following: object[];
  email_verified: boolean;
  listings: object[];
  reviews_received: object[];
  reviews_given: object[]; 

  followers_count: number;
  following_count: number;
  average_rating: number;
  is_following: boolean;
  is_own_profile: boolean;
  created_at: string;
  updated_at: string;
  reviews: Review[];
  bookmarks: Listing[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: any;
}

export interface Comment {
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  time?: string;
  likes?: number;
  replies?: Comment[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  tags: string[];
  allow_swap: boolean;
  allow_negotiation: boolean;
  is_available: boolean;
  is_local_meetup: boolean;
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
  images: { url: string; type: string }[];
  videos: { url: string; type: string }[];
  user: User;
  userId: string;
  likeCount?: number;
  commentCount?: number;
  saveCount?: number;
  comments?: Comment[];
}