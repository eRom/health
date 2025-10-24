# Product Requirements Document (PRD) - Health In Cloud

## Project Overview

**Health In Cloud** is a Next.js 15-based web platform delivering orthophonic and neuropsychological rehabilitation exercises. It serves patients in recovery and healthcare providers with guided exercises, progress tracking, and adherence monitoring.

## Executive Summary

Health In Cloud is a bilingual (French/English) rehabilitation platform designed for the Nantes MPR department. The platform provides a shared experience for patients and healthcare providers, offering guided exercises, progress analytics, and collaborative features to support rehabilitation journeys.

## Product Vision

To provide a comprehensive, accessible, and engaging rehabilitation platform that empowers patients to continue their recovery journey at home while enabling healthcare providers to monitor progress and provide targeted support.

## Target Users

### Primary Users
- **Patients**: Individuals undergoing orthophonic and neuropsychological rehabilitation
- **Healthcare Providers**: Clinicians, therapists, and medical professionals
- **Administrators**: System administrators managing the platform

### User Personas
- **Patient**: Low digital literacy, needs simple UX, accessible design (WCAG 2.1 AA)
- **Healthcare Provider**: Busy professionals needing efficient patient monitoring tools
- **Admin**: Technical users managing platform operations and user accounts

## Core Features & Requirements

### 1. Authentication & User Management
**Priority**: Critical
**Description**: Complete user authentication system with role-based access control

**Requirements**:
- Email/password registration and login
- Google OAuth integration
- Email verification process
- Password reset functionality
- Session management and security
- Role-based access (Patient, Healthcare Provider, Admin)
- Account deletion with GDPR compliance

**Acceptance Criteria**:
- Users can register with email/password or Google OAuth
- Email verification is required before account activation
- Password reset works via email
- Sessions are secure and properly managed
- Users can delete their accounts with data removal

### 2. Exercise Management System
**Priority**: Critical
**Description**: Comprehensive exercise library for different rehabilitation types

**Requirements**:
- Four exercise categories: Neuropsychology, Orthophony, Ergotherapy, Physiotherapy
- Interactive exercise execution
- Progress tracking and attempt recording
- Immediate feedback system
- Difficulty progression
- Exercise completion tracking

**Acceptance Criteria**:
- All four exercise types are accessible and functional
- Users can complete exercises and receive feedback
- Progress is accurately tracked and stored
- Difficulty levels are appropriate and progressive

### 3. Subscription & Payment System
**Priority**: Critical
**Description**: Stripe-powered subscription management with trial periods

**Requirements**:
- 14-day free trial
- Monthly (€19/month) and yearly (€180/year) subscription plans
- Stripe Checkout integration
- Customer portal for subscription management
- Payment failure handling
- Automatic subscription renewal
- Cancellation process

**Acceptance Criteria**:
- Free trial is properly implemented
- Payment processing works correctly
- Users can manage subscriptions via customer portal
- Payment failures are handled gracefully
- Cancellation process is clear and functional

### 4. User Dashboard & Analytics
**Priority**: High
**Description**: Comprehensive dashboard with progress tracking and analytics

**Requirements**:
- Exercise statistics and trends
- Performance analytics (7/30/90 days)
- Recent exercises display
- Progress visualization with charts
- Export capabilities (planned)
- Performance insights

**Acceptance Criteria**:
- Dashboard displays accurate user statistics
- Charts and visualizations are clear and informative
- Time-based filtering works correctly
- Data is updated in real-time

### 5. Badge & Achievement System
**Priority**: High
**Description**: Gamification system to motivate users

**Requirements**:
- Achievement badges for milestones
- Streak tracking
- Progress indicators
- Social sharing capabilities
- Badge notifications
- Motivation system

**Acceptance Criteria**:
- Badges are awarded correctly based on criteria
- Streaks are accurately calculated
- Users receive notifications for achievements
- Sharing functionality works properly

### 6. Healthcare Provider Interface
**Priority**: High
**Description**: Tools for healthcare providers to monitor and support patients

**Requirements**:
- Patient invitation system
- Patient progress monitoring
- Messaging system
- Association management
- Patient statistics overview
- Communication tools

**Acceptance Criteria**:
- Providers can invite and associate with patients
- Patient progress is visible and accurate
- Messaging system is functional
- Provider dashboard shows relevant information

### 7. Admin Panel
**Priority**: Medium
**Description**: Administrative interface for system management

**Requirements**:
- User management (view, delete users)
- System monitoring
- Email management
- User role management
- Platform analytics

**Acceptance Criteria**:
- Admins can view and manage users
- System monitoring tools are functional
- Email management works correctly
- Role management is secure and effective

### 8. Internationalization
**Priority**: Medium
**Description**: Multi-language support for French and English

**Requirements**:
- Complete French and English translations
- Language switching functionality
- Localized content
- Cultural adaptation
- RTL support (if needed)

**Acceptance Criteria**:
- All content is properly translated
- Language switching works seamlessly
- Localized content is culturally appropriate
- UI adapts correctly to different languages

### 9. PWA & Offline Support
**Priority**: Medium
**Description**: Progressive Web App functionality

**Requirements**:
- Service worker implementation
- Offline functionality
- App installation prompts
- Offline exercise access
- Data synchronization

**Acceptance Criteria**:
- App can be installed on mobile devices
- Basic functionality works offline
- Data syncs when connection is restored
- Installation prompts are user-friendly

### 10. Theme & Accessibility
**Priority**: Medium
**Description**: Comprehensive theming and accessibility features

**Requirements**:
- Dark/light theme support
- Multiple style variants
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast options

**Acceptance Criteria**:
- Themes work correctly across all pages
- Accessibility standards are met
- Keyboard navigation is complete
- Screen readers can access all content

## Technical Requirements

### Performance
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Lighthouse scores ≥ 90 (desktop) and ≥ 80 (PWA)

### Security
- EU hosting compliance
- TLS encryption
- Secure session management
- GDPR compliance
- Data protection measures

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Success Metrics

### User Engagement
- Daily active users
- Exercise completion rates
- Session duration
- User retention (7, 30, 90 days)

### Business Metrics
- Trial to paid conversion rate
- Monthly recurring revenue
- Churn rate
- Customer lifetime value

### Technical Metrics
- Page load times
- Error rates
- Uptime
- Performance scores

## Testing Strategy

### Unit Testing
- Component testing with Vitest
- Function testing
- Utility testing
- Coverage target: ≥ 50%

### Integration Testing
- API endpoint testing
- Database integration testing
- Third-party service testing

### End-to-End Testing
- User journey testing with Playwright
- Cross-browser testing
- Mobile testing
- Accessibility testing

### Performance Testing
- Load testing
- Stress testing
- Lighthouse audits
- Core Web Vitals monitoring

## Risk Assessment

### Technical Risks
- Third-party service dependencies (Stripe, Better Auth)
- Database performance at scale
- PWA offline functionality complexity

### Business Risks
- User adoption challenges
- Healthcare compliance requirements
- Competition from established players

### Mitigation Strategies
- Comprehensive testing
- Backup service providers
- Regular security audits
- User feedback integration

## Conclusion

Health In Cloud represents a comprehensive rehabilitation platform that addresses the needs of patients, healthcare providers, and administrators. The platform's success depends on delivering a user-friendly, accessible, and reliable experience while maintaining the highest standards of security and compliance.

The PRD serves as a foundation for development, testing, and quality assurance activities, ensuring that all stakeholders have a clear understanding of the product's requirements and success criteria.