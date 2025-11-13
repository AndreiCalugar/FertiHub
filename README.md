# FertiHub - IVF Procurement Platform

A digital platform that automates the process of collecting and comparing quotes from IVF consumable and equipment suppliers, saving embryologists and lab managers valuable time.

## 🚀 Mission

To save embryologists and IVF lab managers valuable time by simplifying procurement and empowering data-driven purchasing decisions.

## 🎯 Vision

To become the global standard platform for IVF equipment and consumables procurement — connecting fertility labs and manufacturers seamlessly.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **UI Components**: ShadCN UI (Radix UI + Tailwind)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Email Automation**: SendGrid
- **Hosting**: Vercel (frontend) + Supabase (backend)

## 📋 Features (MVP)

### Phase 1 - Foundation ✅
- [x] ShadCN UI component library setup
- [x] Supabase authentication & database configuration
- [x] Database schema with Row Level Security (RLS)
- [x] SendGrid email automation setup
- [x] Email templates (inquiry, follow-up, notifications)

### Phase 2 - Authentication & User Management (In Progress)
- [ ] Login & Signup pages
- [ ] User profile management
- [ ] Organization onboarding flow

### Phase 3 - Core Features (Planned)
- [ ] Dashboard layout with navigation
- [ ] Supplier management (CRUD)
- [ ] Inquiry creation & management
- [ ] Automated email sending to suppliers
- [ ] Manual quote entry
- [ ] Quote comparison dashboard
- [ ] Export to Excel/PDF

### Phase 4 - Notifications & Polish (Planned)
- [ ] In-app notification system
- [ ] Email notifications for key events
- [ ] Dashboard overview with statistics
- [ ] Settings page

### Phase 5 - Deployment (Planned)
- [ ] Production environment setup
- [ ] Vercel deployment
- [ ] Custom domain configuration
- [ ] Automated follow-up cron job

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended for full Next.js 16 support)
- npm or yarn
- Supabase account
- SendGrid account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fertihub.git
   cd fertihub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - Get Supabase credentials from: [Supabase Dashboard](https://supabase.com/dashboard) > Settings > API
   - Get SendGrid API key from: [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys)

4. **Set up Supabase database**
   
   Follow the instructions in `lib/supabase/README.md` to:
   - Create your Supabase project
   - Run database migrations
   - Verify schema setup

5. **Configure SendGrid**
   
   Follow the instructions in `lib/sendgrid/README.md` to:
   - Create SendGrid account
   - Generate API key
   - Verify sender identity

6. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
fertihub/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication routes (login, signup)
│   ├── dashboard/                # Dashboard routes (protected)
│   ├── api/                      # API routes
│   │   └── email/                # Email sending endpoints
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   └── ui/                       # ShadCN UI components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client & middleware
│   ├── sendgrid/                 # SendGrid config & templates
│   ├── types/                    # TypeScript type definitions
│   └── utils.ts                  # Helper functions
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations (SQL)
├── public/                       # Static assets
├── .env.local                    # Environment variables (not in git)
├── .env.example                  # Example environment variables
└── middleware.ts                 # Next.js middleware (auth protection)
```

## 🗄 Database Schema

The database includes the following tables:

- **user_profiles**: Extended user information (organization, role, location)
- **suppliers**: Supplier contacts managed by users
- **product_categories**: Pre-defined IVF product categories
- **inquiries**: Quote requests created by users
- **inquiry_suppliers**: Junction table tracking supplier contact status
- **quotes**: Supplier quotes (manually entered in MVP)
- **notifications**: In-app notifications

All tables have Row Level Security (RLS) enabled for user data isolation.

See `supabase/migrations/` for complete schema definition.

## 📧 Email Automation

FertiHub automates email communication with suppliers:

1. **Initial Inquiry**: Automatically sent when user creates an inquiry
2. **Follow-up Reminders**: Sent based on urgency level (manual in MVP, automated in future)
3. **User Notifications**: Alerts when quotes are received

Email templates are professionally designed and mobile-responsive.

See `lib/sendgrid/README.md` for configuration details.

## 🔐 Authentication & Security

- Authentication powered by Supabase Auth
- Protected routes via Next.js middleware
- Row Level Security (RLS) on all database tables
- User-scoped data access
- Secure API endpoints

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Production Checklist

- [ ] Set up production Supabase project
- [ ] Configure production SendGrid sender domain
- [ ] Add environment variables to Vercel
- [ ] Set up custom domain (fertihub.ai)
- [ ] Configure Supabase RLS policies
- [ ] Set up automated follow-up cron job
- [ ] Test email deliverability
- [ ] Enable Vercel analytics

## 📚 Documentation

- [Supabase Setup Guide](lib/supabase/README.md)
- [SendGrid Configuration](lib/sendgrid/README.md)
- [Database Migrations](supabase/migrations/README.md)
- [Database Types](lib/types/database.types.ts)

## 🤝 Contributing

This is currently a private MVP project. Contribution guidelines will be added in the future.

## 📄 License

Proprietary - All rights reserved

## 📞 Contact

For questions or support, contact: [your-email@example.com]

---

**Current Version**: 0.1.0 (Phase 1 Complete)

**Last Updated**: November 2024
