# UniMarkets: Project Requirements Document

## 1. Project Overview

### 1.1 Introduction
UniMarkets is a Next.js-based social commerce platform designed exclusively for university students to buy, sell, and swap items within their campus community. The platform features a secure escrow payment system, in-app negotiation capabilities, and a verification system to ensure only university students can participate.

### 1.2 Objectives
- Create a secure and user-friendly marketplace exclusively for university students
- Implement a robust escrow payment system for secure transactions
- Enable direct negotiations between buyers and sellers
- Facilitate smooth item exchanges with verification codes
- Support item returns and refunds when necessary
- Build a responsive, mobile-first application using Next.js

### 1.3 Target Audience
- University students looking to buy, sell, or swap items
- Focus on creating a trusted community marketplace environment

## 2. Technical Requirements

### 2.1 Architecture Overview
The application will be built using Next.js 14+ with App Router, leveraging server components and server actions to create a serverless architecture. This approach eliminates the need for a traditional backend while maintaining robust functionality.

### 2.2 Tech Stack
- **Frontend Framework**: Next.js 14+ (App Router)
- **UI Library**: Tailwind CSS, Shadcn UI components
- **Authentication**: NextAuth.js with email verification
- **Database**: Prisma ORM with PostgreSQL (using Vercel Postgres or similar)
- **Payment Processing**: Integration with Paystack API
- **State Management**: React Context API or Zustand
- **Image Handling**: Firebase cloud storage
- **Messaging And Notification handling**: Firebase Messaging service with firestore
- **Deployment**: Vercel

### 2.3 Data Storage
- User data stored in PostgreSQL database
- Images stored in Firebase cloud storage
- Transaction records maintained in PostgreSQL

## 3. Key Features

### 3.1 User Authentication & Verification
- Email verification using university email domains (@*.edu, etc.)
- Profile creation with student ID verification
- User ratings and review system
- Multi-factor authentication for enhanced security

### 3.2 Listing Management
- Create, edit, delete listings
- Categories and subcategories for items
- Multiple image/videos uploads
- Set fixed price or mark as negotiable
- Specify item condition (new, like new, good, fair, etc.)
- Add detailed item descriptions
- Option to mark items as "swap only"

### 3.3 Search & Discovery
- Advanced search functionality with filters
- Browse by categories
- Location-based search within campus
- Saved searches and alerts
- Recommended items based on browsing history

### 3.4 Negotiation System
- In-app chat for price negotiations
- Offer submission functionality
- Counter-offer capability
- Negotiation history tracking
- Price adjustment by seller upon agreement

### 3.5 Escrow Payment System
- Integration with Paystack payment gateway
- Secure fund holding until transaction completion
- Verification code generation for buyers and sellers
- Time-based automatic fund release (configurable 2-5 days based on item category or subcategory)
- Partial payment and installment options

### 3.6 Exchange Verification
- Unique single-use verification codes for buyers and sellers
- QR code generation option for easy scanning during meetup
- Real-time verification of code exchanges
- Timestamp recording of exchanges

### 3.7 Returns & Refunds
- Return request initiation process
- Return verification codes generation
- Return status tracking
- Refund processing through Paystack API
- Dispute resolution system

### 3.8 Notifications
- Real-time push notifications (using firebase push notification system)
- Email notifications for critical updates
- In-app notification center
- SMS notifications for verification codes (optional)

### 3.9 Social Features
- User profiles with transaction history
- Ratings and reviews for users
- Follow favorite sellers
- Share listings to social media platforms
- Direct messaging between users

## 4. User Flows

### 4.1 Registration & Onboarding
1. User signs up with university email
2. Verification email sent to confirm university affiliation
3. Complete profile with required details including student ID
4. Brief tutorial on platform features
5. Enable notification preferences

### 4.2 Creating a Listing
1. User navigates to "Create Listing" section
2. Uploads images and fills in item details
3. Sets price or marks as "Negotiable" or "Swap Only"
4. Chooses item category and condition
5. Adds description and meeting preferences
6. Reviews and publishes listing

### 4.3 Buying Process
1. User browses listings or searches for specific items
2. Views detailed listing information
3. For fixed price: Initiates purchase directly
4. For negotiable price: Starts negotiation chat
5. Makes offer through structured offer system
6. Upon agreement, proceeds to payment
7. Funds held in escrow, receives verification code
8. Meets seller for exchange and code verification
9. Inputs seller's code to release payment or initiates return if necessary

### 4.4 Selling Process
1. User creates and publishes listing
2. Responds to inquiries and offers
3. For negotiable items: Negotiates through chat
4. Accepts offer and adjusts price accordingly
5. Receives notification of payment and verification code
6. Meets buyer for exchange
7. Exchanges codes with buyer
8. Inputs buyer's code to initiate fund release

### 4.5 Returns Process
1. Buyer initiates return request within timeframe
2. Return verification codes generated for both parties
3. Buyer and seller meet for item return
4. Codes are exchanged and entered
5. Refund processed through Paystack

## 5. Escrow System Details

### 5.1 Transaction Flow
1. Buyer initiates purchase and pays through Paystack
2. Funds held in escrow account (not released to seller)
3. System generates unique verification codes for buyer and seller
4. Physical exchange occurs between parties
5. Both parties input received codes into system
6. System verifies code authenticity
7. Payment released to seller after holding period

### 5.2 Holding Periods
- Standard items: 2 days after code verification
- Electronics and higher value items: 3-4 days
- Sensitive or specialized items: 5 days
- Holding period clearly displayed during transaction

### 5.3 Security Measures
- One-time use verification codes
- Expiration timeline for codes (24-48 hours)
- Verification code delivery through secure channels
- Transaction insurance options for high-value items
- Fraud detection algorithms

## 6. Database Schema

### 6.1 Core Tables
- Users
- Listings
- Categories
- Transactions
- Messages
- Offers
- Reviews
- Notifications
- VerificationCodes

### 6.2 Key Relationships
- User has many Listings
- Listing belongs to Category
- Transaction belongs to Buyer and Seller
- Transaction has one Listing
- Users can send Messages to each other
- Offers belong to Listings and Users
- Reviews belong to Users

## 7. API Integration

### 7.1 Paystack Integration
- Payment processing
- Transaction verification
- Refund processing
- Webhooks for transaction status updates

### 7.2 Email Service Integration
- Verification emails
- Transaction notifications
- System updates and alerts

### 7.3 SMS Gateway (Optional)
- Code delivery
- Critical alerts

### 7.4 Cloud Storage Integration
- Image storage and optimization
- File management

## 8. UI/UX Requirements

### 8.1 General Design Principles
- Clean, minimalist interface
- Mobile-first responsive design
- Accessible UI components
- University/campus-themed visual elements
- Consistent color scheme and typography

### 8.2 Key UI Components
- User dashboard
- Listing cards and detailed views
- Search interface with filters
- Chat/negotiation interface
- Payment flow screens
- Verification code entry screens
- Profile pages with reputation metrics
- Notification center

### 8.3 Responsive Design
- Fully functional on mobile devices
- Optimized layouts for tablet and desktop
- Touch-friendly interface elements
- Progressive Web App capabilities

## 9. Security Considerations

### 9.1 Data Protection
- Encrypted storage of sensitive information
- HTTPS implementation
- Regular security audits
- Compliance with relevant data protection regulations

### 9.2 Transaction Security
- Secure payment processing
- Multi-factor authentication for high-value transactions
- Fraud prevention measures
- Verification code security

### 9.3 User Privacy
- Clear privacy policy
- User control over shared information
- Data minimization principle
- Regular data cleanup for inactive users

## 10. Development Approach

### 10.1 Next.js Implementation Strategy
- Use App Router for optimized server-side rendering and routing
- Implement server components where appropriate
- Utilize server actions for form handling and data mutations
- Create API routes for external integrations
- Implement middleware for authentication and security

### 10.2 Serverless Architecture
- Leverage Next.js API routes for serverless functions
- Use edge functions where appropriate for improved performance
- Implement database caching strategies
- Optimize for Vercel deployment

### 10.3 Development Phases
1. **Phase 1**: Core functionality (user auth, listings, basic search)
2. **Phase 2**: Negotiation system and chat functionality
3. **Phase 3**: Escrow payment system implementation
4. **Phase 4**: Exchange verification and return process
5. **Phase 5**: Social features and enhanced discovery
6. **Phase 6**: Testing, optimization, and launch

### 10.4 Testing Strategy
- Component testing with Jest and React Testing Library
- Integration testing of key user flows
- E2E testing with Cypress
- Payment system testing in sandbox environment
- Security penetration testing

## 11. Deployment & Maintenance

### 11.1 Deployment Strategy
- CI/CD pipeline setup with GitHub Actions
- Staging environment for pre-release testing
- Production deployment on Vercel
- Database migration strategy

### 11.2 Monitoring & Analytics
- Error tracking with Sentry or similar
- Performance monitoring
- User behavior analytics
- Conversion tracking

### 11.3 Maintenance Plan
- Regular security updates
- Feature enhancement roadmap
- Bug fixing process
- Database optimization

## 12. Future Enhancements

### 12.1 Potential Extensions
- Mobile native apps (React Native)
- Integration with university ID systems
- AI-powered pricing suggestions
- AR product visualization
- Community events and marketplace meetups
- Expansion to additional universities

## 13. Project Timeline

### 13.1 Estimated Development Schedule
- Initial Setup & Authentication: 2 weeks
- Listing Management & Search: 3 weeks
- Negotiation & Chat System: 3 weeks
- Escrow Payment Implementation: 4 weeks
- Exchange & Return Process: 3 weeks
- Testing & Refinement: 3 weeks
- Launch Preparation: 2 weeks

### 13.2 Milestones
- Alpha Release: Core functionality for limited user testing
- Beta Release: Complete feature set with payment system for broader testing
- Official Launch: Full platform rollout with marketing campaign

## 14. Conclusion

UniMarkets aims to create a secure, user-friendly platform for university students to buy, sell, and swap items within their campus community. By leveraging Next.js and implementing a robust escrow system, the platform will provide a trustworthy environment for peer-to-peer commerce with built-in safeguards for all transactions.

This project requirements document serves as the foundation for development and should be reviewed and updated as the project progresses.