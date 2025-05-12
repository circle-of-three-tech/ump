# Product Requirements Document: UMP Next.js Application

## 1. Product Overview

**Product Name:** UMP  
**Type:** Next.js web application (responsive design with mobile optimization)  
**Target Users:** University/college students  
**Core Idea:** A peer-to-peer social marketplace enabling students to buy, sell, rent, or exchange items and services within their campus network. The platform merges marketplace functionality with social media features for discovery and engagement.

## 2. Goals & Objectives

### Business Goals
- Enable seamless peer-to-peer commerce on university campuses
- Build a sticky, engaged user base with social features
- Monetize via featured listings and transaction commissions
- Leverage Next.js for SEO optimization and improved discovery of listings
 
### User Goals
- Easily list and discover items and services
- Interact with sellers and buyers in a familiar, social way
- Build trust through real identities, reviews, and campus-based verification
- Access the platform seamlessly across devices (desktop, tablet, mobile)

## 3. Technical Stack & Architecture

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS with daisyUI components
- **State Management:** React Context API with SWR for data fetching
- **Authentication:** NextAuth.js with JWT

### Backend
- **API Routes:** Next.js API Routes (serverless functions)
- **Database:** PostgreSQL with Prisma ORM
- **Storage:** Vercel Blob Storage or AWS S3 for media
- **Caching:** Vercel Edge Caching and local SWR caching

### DevOps
- **Hosting:** Vercel (primary) with optional AWS failover
- **CI/CD:** GitHub Actions integrated with Vercel deployments
- **Monitoring:** Vercel Analytics and Sentry for error tracking

## 4. Features & Requirements

### 4.1 User Authentication
- Sign up via .edu or official university email
- Optional student ID upload for "Verified Student" badge
- OAuth (Google/Microsoft) integration for faster login
- Password recovery and account management
- JWT-based session management with secure HTTP-only cookies

### 4.2 User Profile
- Profile info: Name, photo, university, bio
- Public profile page shows:
  - Listings (active/sold)
  - Ratings & reviews
  - Followers/Following
  - "Verified Student" badge (optional but incentivized)
- SEO-optimized profile pages for better discovery

### 4.3 Listings
- Create/edit/delete listings with form validation
- Categories: Books, Electronics, Furniture, Clothing, Services, Housing, Tickets, Ride Shares
- Rich media attachment (images, videos) with client-side compression
- Tags, location, condition, and swap/negotiation options
- Server-side rendering for listing pages to improve SEO

### 4.4 Feed (Home & Explore)
- Infinite scroll feed of listings with lazy loading
- "Home" feed: prioritized by interests, follows, campus
- "Explore" feed: broader discovery across categories/campuses
- Responsive grid layout that adapts to screen size
- Skeleton loading states for improved UX

### 4.5 Social Features
- Likes, shares, bookmarks (saved items)
- Comments under each listing
- Follow users to get updates
- Repost listings to your feed
- Real-time updates using WebSockets or SWR polling

### 4.6 Search & Filtering
- Full-text search on titles, descriptions, and tags
- Filters: category, price, location, condition, availability
- Smart search suggestions based on user behavior
- URL-based search parameters for shareability and SEO
- Server-side pagination for better performance

### 4.7 Messaging
- 1-on-1 chat between buyer and seller
- Optional listing attachment in chat
- Read receipts, media support (images, links)
- Real-time updates using WebSockets
- Message history persistence

### 4.8 Transactions
- In-app payment (Stripe integration)
- Transaction statuses: pending, completed, cancelled
- Escrow feature (optional)
- Manual mode for local meetups/cash exchanges
- Email notifications for transaction status changes

### 4.9 Reviews & Ratings
- One-time review after transaction completion
- Ratings out of 5 with text review
- Flag/report abusive users or spam
- Moderation queue for reported content

### 4.10 Notifications
- In-app notifications center
- Email notifications (transactional and digest)
- Push notifications via web push API
- Custom notification preferences

## 5. User Roles & Permissions

### Student (default)
- Can list, buy, chat, comment, follow
- Access to standard user dashboard

### Verified Student
- Additional trust badge
- Priority in search results
- Access to exclusive features

### Admin
- Moderate reported content
- Remove users/listings
- Send announcements or university-specific broadcasts
- Access to admin dashboard with analytics

## 6. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  university VARCHAR(100),
  profile_pic TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Listings Table
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(50),
  price DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT true,
  allow_swap BOOLEAN DEFAULT false,
  is_local_meetup BOOLEAN DEFAULT true,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Listing Media Table
```sql
CREATE TABLE listing_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  media_url TEXT,
  media_type VARCHAR(10) -- 'image', 'video'
);
```

### Additional tables for comments, likes, messages, ratings, transactions, and followers following the same structure as in the original schema.

## 7. User Flows (High-Level)

### New User Onboarding
1. Sign up via .edu email
2. Set up profile
3. (Optional) Verify with student ID
4. Begin exploring or listing

### Listing Creation
1. Click "+" button in navigation
2. Add photos/video, title, description
3. Select category, condition, tags
4. Set price, availability, swap option
5. Post to feed

### Buying an Item
1. Find item via feed/search
2. Click listing to view detail
3. Message seller or click "Buy Now"
4. Choose payment option or coordinate meetup
5. Complete transaction
6. Leave review

## 8. Next.js-Specific Implementation Requirements

### Page Structure
- `/` - Home feed (authenticated users) or landing page (guests)
- `/explore` - Discovery feed
- `/listings/[id]` - Individual listing page
- `/profile/[id]` - User profile page
- `/messages` - Messaging center
- `/messages/[id]` - Individual conversation
- `/create-listing` - New listing form
- `/auth/signin` - Authentication page
- `/auth/signup` - Registration page
- `/settings/[section]` - User settings
- `/admin/*` - Admin pages (protected routes)

### Performance Optimization
- Implement ISR (Incremental Static Regeneration) for listing pages
- Use dynamic imports for code splitting
- Optimize images with Next.js Image component
- Implement staggered loading for feed content
- Defer non-critical JavaScript with `next/script`

### SEO & Metadata
- Dynamic meta tags for all pages
- Structured data for listings (JSON-LD)
- Sitemap generation for public pages
- robots.txt configuration
- OpenGraph and Twitter card meta tags

### Accessibility
- Semantic HTML throughout the application
- ARIA attributes where appropriate
- Keyboard navigation support
- Color contrast WCAG AA compliance
- Screen reader compatibility

### Mobile Responsiveness
- Mobile-first design approach
- Touch-friendly interface elements
- Responsive navigation (hamburger menu on mobile)
- Optimized media viewing for mobile devices
- Native-like feel with swipe gestures where appropriate

## 9. Non-Functional Requirements

### Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Core Web Vitals passing threshold
- API response time < 400ms

### Security
- CSRF protection
- XSS prevention
- Rate limiting on API routes
- Input validation on all forms
- Secure authentication flow

### Scalability
- Horizontal scaling via serverless functions
- Database connection pooling
- Efficient caching strategy
- CDN for static assets

### Internationalization
- i18n support (using next-i18next)
- Right-to-left language support
- Date/time formatting for different locales

## 10. Analytics & Monitoring

- Google Analytics 4 integration
- Custom event tracking
- User journey analysis
- A/B testing capability
- Error monitoring via Sentry
- Performance monitoring via Vercel Analytics

## 11. Future Enhancements

- Group listings (student orgs)
- Campus events/ticket resale
- AI item suggestion/matching
- In-app story feature for quick deals
- Social commerce affiliate program (refer and earn)
- Progressive Web App capabilities
- Native mobile app wrappers

## 12. Success Metrics

### Activation
- % of verified students per campus
- # of listings created per week

### Engagement
- DAUs/MAUs, time spent per session
- Listings interaction rate (likes/comments/messages)

### Transaction Metrics
- GMV (Gross Merchandise Volume)
- Conversion rate: views → chats → purchases

### Retention
- Weekly/monthly active retention
- Repeat transactions per user

### Technical Metrics
- Core Web Vitals performance
- Error rate
- API response times
- Build & deployment times