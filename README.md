# Fixora Marketplace

A modern, scalable marketplace platform for homes, offices, apartments, and commercial buildings. Buy and sell premium electronics, appliances, furniture, smart-home devices, lighting, tools, building materials, and more.

## Project Overview

**Fixora Marketplace** is built as a production-ready frontend foundation using Next.js with a clean, professional architecture. This is Day 01 of the development, establishing a scalable foundation for a 30-day build.

### Project Vision

- **Target Users**: Buyers and sellers of home, office, and commercial products
- **Platform**: Modern web marketplace with responsive design
- **Quality**: Professional, fast, accessible, and easy to use
- **Scale**: Support for multiple categories, products, sellers, and administrators

## Tech Stack

- **Framework**: [Next.js 16.3](https://nextjs.org) with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) (foundation installed)
- **Icons**: [Lucide React](https://lucide.dev)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com)
- **Validation**: [Zod](https://zod.dev)
- **Backend**: [Supabase](https://supabase.com) (to be configured)
- **Linting**: [ESLint](https://eslint.org)

## Prerequisites

- **Node.js**: v18.17 or higher
- **npm**: v9+ or **pnpm** v8+
- **Git**: for version control
- **Supabase Account** (optional, for authentication setup)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/oliahmedkhan/Marketplace.git
cd fixora-marketplace
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: Never commit real secrets. `.env.local` is ignored by Git.

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Design foundation & CSS variables
│   ├── (public)/               # Public routes (no layout)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (customer)/             # Customer routes with MainLayout
│   │   ├── products/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── wishlist/page.tsx
│   │   └── account/page.tsx
│   ├── admin/                  # Admin dashboard
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── seller/                 # Seller dashboard
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Footer.tsx          # Footer
│   │   ├── MainLayout.tsx      # Main layout wrapper
│   │   └── Container.tsx       # Responsive container
│   ├── ui/                     # shadcn/ui components
│   ├── product/
│   │   └── ProductCard.tsx     # Reusable product card
│   ├── cart/                   # Cart components
│   ├── admin/                  # Admin components
│   └── shared/                 # Shared components
├── features/                   # Feature-based modules
│   ├── auth/                   # Authentication logic
│   ├── products/               # Product management
│   ├── categories/             # Category management
│   ├── cart/                   # Cart management
│   ├── orders/                 # Order management
│   ├── inventory/              # Inventory management
│   └── users/                  # User management
├── lib/
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
└── public/                     # Static assets

```

## Available Routes

### Public Routes (No Header/Footer)

- `/login` - User login page
- `/register` - User registration page

### Customer Routes (With Header/Footer)

- `/` - Homepage
- `/products` - All products listing
- `/categories` - Category browsing
- `/cart` - Shopping cart
- `/wishlist` - Saved items
- `/account` - User account profile

### Admin Routes

- `/admin` - Admin dashboard
- `/admin/products` (placeholder)
- `/admin/orders` (placeholder)

### Seller Routes

- `/seller` - Seller dashboard
- `/seller/products` (placeholder)

## Design Foundation

### Color Scheme

- **Primary**: Slate 900 (`#0f172a`)
- **Accent**: Blue 500 (`#3b82f6`)
- **Success**: Emerald 500 (`#10b981`)
- **Warning**: Amber 500 (`#f59e0b`)
- **Error**: Red 500 (`#ef4444`)
- **Neutral**: Slate grays

### Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+

### Typography

- **Font Family**: Inter (system fallback)
- **Font Sizes**: Responsive scaling from mobile to desktop
- **Line Height**: 1.6 (optimal reading)

### Spacing System

- Base unit: 0.25rem (4px)
- Scale: xs (0.25rem), sm (0.5rem), md (1rem), lg (1.5rem), xl (2rem), 2xl (3rem)

### Interactions

- Smooth transitions (150ms, 200ms, 300ms)
- Focus states for accessibility
- Hover effects on interactive elements
- Mobile-first responsive behavior

## Development Guidelines

### Code Quality Standards

- ✅ TypeScript strict mode
- ✅ Meaningful, descriptive naming
- ✅ Reusable, modular components
- ✅ No hardcoded values (use constants)
- ✅ No `any` type unless absolutely necessary
- ✅ No duplicate code (DRY principle)
- ✅ Clean imports using path aliases

### Component Naming

```
✅ Good:  ProductCard.tsx, MarketplaceHeader.tsx, ResponsiveContainer.tsx
❌ Avoid: final.tsx, test2.tsx, newcomponent.tsx, product-final-final.tsx
```

### Import Paths

Use configured aliases for clean imports:

```typescript
// ✅ Good
import { ProductCard } from "@/components/product/ProductCard";
import { useCart } from "@/lib/hooks/useCart";

// ❌ Avoid
import { ProductCard } from "../../../../components/product/ProductCard";
```

## Build Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production
npm run build        # Build for production
npm run start        # Run production build locally

# Code Quality
npm run lint         # Run ESLint
npm run lint --fix   # Fix linting issues
```

## Key Features (Day 01 Foundation)

✅ **Responsive Design**

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly mobile navigation

✅ **Clean Architecture**

- Feature-based folder structure
- Reusable components
- Separation of concerns

✅ **Performance Ready**

- Next.js optimization
- Image optimization ready
- Clean CSS foundation

✅ **Accessibility**

- Semantic HTML
- ARIA labels where needed
- Focus states
- Keyboard navigation support

✅ **Developer Experience**

- TypeScript for type safety
- Consistent code style
- Clear project structure
- Environment configuration

## What's NOT Included (By Design)

The following features are intentionally excluded for Day 01 to maintain focus:

- ❌ Cart functionality (backend integration)
- ❌ Checkout & payment processing
- ❌ Authentication (Supabase setup only)
- ❌ Product CRUD operations
- ❌ Admin dashboard functionality
- ❌ Seller functionality
- ❌ Search & filtering (backend)
- ❌ AI features
- ❌ Complete order management

These will be implemented in Days 02-30.

## Testing

### Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Navigation header responsive on mobile/tablet/desktop
- [ ] All routes accessible
- [ ] Product cards display properly
- [ ] Forms are accessible
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Images/icons load
- [ ] Links navigate correctly
- [ ] Mobile menu works
- [ ] Footer visible on all pages

### Responsive Testing Sizes

- Mobile: ~375px (iPhone SE)
- Tablet: ~768px (iPad)
- Desktop: ~1280px+ (Desktop)

## Environment Variables

### Required (Development)

```
NEXT_PUBLIC_SUPABASE_URL=          # From Supabase project
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # From Supabase project
```

### Note

- `NEXT_PUBLIC_*` variables are exposed to the browser
- Never include sensitive secrets in these variables
- Always use `.env.local` for local development
- Never commit `.env.local` to Git

## Git Workflow

Currently working on feature branch:

```
feature/frontend-setup
```

### Commit Convention

```
chore: initialize fixora marketplace frontend
feat: add shared marketplace layout
feat: add responsive navigation foundation
docs: add project setup instructions
```

## Next Steps (Day 02+)

1. **Authentication**: Supabase auth integration
2. **State Management**: Zustand store setup
3. **API Integration**: Backend API endpoints
4. **Product Management**: CRUD operations
5. **Shopping Cart**: Add to cart, update, remove
6. **Search & Filters**: Product discovery
7. **User Profiles**: Account management
8. **Payment Integration**: Stripe/Supabase integration
9. **Admin Dashboard**: Product & order management
10. **Seller Dashboard**: Inventory management

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000 and restart
npm run dev -- -p 3001   # Use different port
```

### Dependencies Issues

```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### TypeScript Errors

```bash
npm run lint --fix       # Fix linting issues
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)

## Support

For issues or questions, please refer to:

- Project documentation in `docs/`
- GitHub issues in the repository
- Supabase documentation for backend setup

## License

This project is part of the Fixora Marketplace initiative.

---

**Last Updated**: August 2024  
**Status**: Day 01 - Foundation Phase ✨

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
