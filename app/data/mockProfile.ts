import type { User } from '../types';

export const mockProfile: User = 
  {
    id: "9074vfeg13857932frew",
  name: "Victor Olorunda",
  image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  university: "Uniben",
  interests: ["Volley ball", "sky diving"],
  bio: "I am happy...", 
  student_id_image: "https://unsplash.com/photos/silhouette-of-man-illustration-2LowviVHZ-E", 
  verification_status: "ACTIVE", 
  profile_completed: true, email_verified: true,
  is_verified: true,
  email: 'victorolorunda6@gmail.com',
    listings: [
      {
        id: "1",
        title: "Laptop for Sale",
        description: "A gently used laptop in great condition.",
        price: 500,
        images: [
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000',
      
          "https://images.unsplash.com/photo-1517841905240-472988babdf9",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9"
        ],
        category: "Electronics",
        condition: "Used",
        createdAt: "2023-10-01T12:00:00Z",
        user: {
          id: "1",
          name: "Victor Olorunda",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben"
        },
        likes: 10,
        comments: 5,
        status: "ACTIVE",
        isBookmarked: false
      },
      {
        id: "2",
        title: "Sofa for Sale",
        description: "A comfortable sofa in excellent condition.",
        price: 300,
        images: [
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000',
        
          "https://images.unsplash.com/photo-1517841905240-472988babdf9",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9"
        ],
        category: "Furniture",
        condition: "Used",
        createdAt: "2023-10-01T12:00:00Z",
        user: {
          id: "1",
          name: "Victor Olorunda",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben"
        },
        likes: 5,
        comments: 2,
        status: "ACTIVE",
        isBookmarked: false
      }
    ],
    reviews_received: [
      {
        id: "1",
        rating: 5,
        comment: "Great experience!",
        createdAt: "2023-10-01T12:00:00Z",
        reviewer: {
          id: "1",
          name: "John Doe",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben"
        }
      },
      {
        id: "2",
        rating: 5,
        comment: "Great experience!",
        createdAt: "2023-10-01T12:00:00Z",
        reviewer: {
          id: "2",
          name: "John Doe",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben"
        }
      }],
    
    followers_count: 80,
    following_count: 40,


    average_rating: 4.8,
    is_following: false,
    is_own_profile: true,
    created_at: '2023-10-01T12:00:00Z',
    updated_at: '2023-10-01T12:00:00Z',
    profile_image: 'https://unsplash.com/photos/silhouette-of-illustration-2LowviVHZ-E',
    reviews: [
      {
        id: "1",
        rating: 5,
        comment: "Great experience!",
        createdAt: "2023-10-01T12:00:00Z",
        reviewer: {
          id: "2",
          name: "John Doe",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben",
        }
      },
      {
        id: "2",
        rating: 4,
        comment: "Good service.",
        createdAt: "2023-10-01T12:00:00Z",
        reviewer: {
          id: "3",
          name: "Jane Smith",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben",
        }
      }
    ],
    bookmarks: [
      {
        id: "1",
        title: "Laptop for Sale",
        description: "A gently used laptop in great condition.",
        price: 500,
        images: [
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000',

          "https://images.unsplash.com/photo-1517841905240-472988babdf9",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9"
        ],
        category: "Electronics",
        condition: "Used",
        createdAt: "2023-10-01T12:00:00Z",
        user: {
          id: "1",
          name: "Victor Olorunda",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben"
        },
        likes: 10,
        status: "ACIVE",
        comments: 5,
        isBookmarked: false
      },
      {
        id: "2",
        title: "Sofa for Sale",
        description: "A comfortable sofa in excellent condition.",
        price: 300,
        images: [
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000',
    
          "https://images.unsplash.com/photo-1517841905240-472988babdf9",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9"
        ],
        category: "Furniture",
        condition: "Used",
        createdAt: "2023-10-01T12:00:00Z",
        user: {
          id: "1",
          name: "Victor Olorunda",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben",
        },
        status: "ACIVE",
        likes: 5,
        comments: 2,
        isBookmarked: false
      }
    ],
    followers:  [
      {
        id: "2",
        name: "John Doe",
        image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        university: "Uniben",
      },
      {
        id: "3",
        name: "Jane Smith",
        image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        university: "Uniben",
      }
    ],
    following: [
      {
        id: "4",
        name: "Alice Johnson",
        image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        university: "Uniben",
      },
      {
        id: "5",
        name: "Bob Brown",
        image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        university: "Uniben",
      }
    ],
    reviews_given: [
      {
        id: "1",
        rating: 5,
        comment: "Great experience!",
        createdAt: "2023-10-01T12:00:00Z",
        reviewer: {
          id: "2",
          name: "John Doe",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben"
        }
  },
      {
        id: "2",
        rating: 4,
        comment: "Good service.",
        createdAt: "2023-10-01T12:00:00Z",
        reviewer: {
          id: "3",
          name: "Jane Smith",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          university: "Uniben"
        }
      }
    ]
  };