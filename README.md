# Expenses Dashboard

A modern, high-performance expenses management portal built with Next.js 15, React 19, and Tailwind CSS. This project focuses on visual excellence, accessibility, and a robust isomorphic authentication architecture.

## 🚀 Key Features

- **Modern Tech Stack**: Leverages Next.js App Router, React Server Components, and Zod validation.
- **Premium Design**: Custom dark-themed UI with "Roboto Slab" typography, smooth animations, and refined micro-interactions.
- **Isomorphic Authentication**: A robust, cookie-based auth system that works seamlessly across Client and Server components, replacing legacy `sessionStorage` patterns.
- **Centralized Route Protection**: Global middleware handles unauthenticated redirects and protects sensitive dashboard routes at the edge.
- **Accessibility (A11y)**: Semantic HTML5 structure with comprehensive ARIA support and optimized screen-reader announcements.
- **SEO & Performance**: Optimized image handling via Next.js `Image` (using static imports and proper `sizes`), semantic meta tags, and fast page loads.
- **Enhanced UX**: Includes custom error tooltips (the "red bubble" pattern), dark-mode-first styling, and handled browser autofill overrides.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Form Management**: `react-hook-form`
- **Validation**: `zod`
- **Icons**: `lucide-react`
- **Notifications**: `sonner`
- **Fonts**: `next/font/google` (Roboto Slab)

## 📁 Project Structure

```text
src/
├── app/            # Next.js App Router (pages & layouts)
├── components/     # Reusable UI & Layout components
├── contexts/       # React Contexts (Auth, etc.)
├── lib/            # Utilities, API Client, and Auth Helpers
└── assets/         # Static assets (images, logos)
```

## 🏗 Getting Started

### Prerequisites

- Node.js 24+ 
- npm / yarn / pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your API URL:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔐 Authentication Architecture

The project uses an isomorphic cookie-based approach:
- **Client Side**: `AuthContext` manages the global user state and provides `signIn`/`signOut` methods.
- **Server Side**: `middleware.ts` reads the `auth_token` directly from cookies to handle redirects before the page even renders.
- **Isomorphic Helpers**: `auth-helpers.ts` provides consistent access to tokens and user data on both the client and server.

---

Built with ❤️ for a premium expense management experience.
