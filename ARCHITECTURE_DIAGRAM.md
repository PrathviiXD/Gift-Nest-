# GiftNest Platform Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GIFTNEST PLATFORM                              │
└─────────────────────────────────────────────────────────────────────────┘

                              USER BROWSER
                          ┌──────────────────┐
                          │  React 19 + TS   │
                          │  Vite SPA        │
                          │                  │
                          │  Pages:          │
                          │  • Home          │
                          │  • Catalog       │
                          │  • Product       │
                          │  • Cart          │
                          │  • Checkout      │
                          │  • Auth          │
                          │  • Orders        │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌─────────────┐  ┌──────────┐  ┌──────────────┐
            │ Navigation  │  │ AIChatbot│  │ Components   │
            │ Router      │  │ (Grok)   │  │ Products     │
            │ Auth Flow   │  │ Voice    │  │ Cart         │
            └─────────────┘  └────┬─────┘  └──────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌─────────────┐  ┌──────────┐  ┌──────────────┐
            │   Context   │  │ Hooks    │  │   Utils      │
            │ • Auth      │  │ • useGrok│  │ • formatPrice│
            │ • Cart      │  │ • useMob │  │ • cn (utils) │
            └─────────────┘  └──────────┘  └──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌─────────────────────┐        ┌────────────────────┐
        │  Supabase Edge      │        │  External APIs     │
        │  Functions          │        │                    │
        │                     │        │  • Razorpay (Pay)  │
        │ grok-               │        │  • Grok API (AI)   │
        │ recommendations     │        │  • Image CDN       │
        └──────────┬──────────┘        └────────────────────┘
                   │
                   ▼
        ┌─────────────────────────────────┐
        │  GROK AI API                    │
        │                                 │
        │  • NLP Understanding            │
        │  • Gift Recommendations         │
        │  • Contextual Analysis          │
        │  • Temperature: 0.7             │
        │  • Max Tokens: 500              │
        └─────────────────────────────────┘
        
        
        ┌─────────────────────┐
        │  Supabase Backend   │
        │                     │
        │  ┌───────────────┐  │
        │  │  PostgreSQL   │  │
        │  │  Database     │  │
        │  │               │  │
        │  │  Tables:      │  │
        │  │  • Users      │  │
        │  │  • Products   │  │
        │  │  • Orders     │  │
        │  │  • Cart       │  │
        │  └───────────────┘  │
        │                     │
        │  ┌───────────────┐  │
        │  │  Auth         │  │
        │  │  (Email/Pass) │  │
        │  └───────────────┘  │
        │                     │
        │  ┌───────────────┐  │
        │  │  Storage      │  │
        │  │  (Images)     │  │
        │  └───────────────┘  │
        └─────────────────────┘
```

## Data Flow Diagrams

### 1. Gift Recommendation Flow

```
User Input
   │
   ▼
"Birthday gift for mom under 3000"
   │
   ├─► Parse Query
   │
   ├─► AIChatbot Component
   │
   ├─► use-grok Hook
   │   • Prepare request
   │   • Add auth headers
   │   • Build payload
   │
   ├─► Supabase Edge Function (grok-recommendations)
   │   • Validate input
   │   • Check API key
   │   • Format prompt
   │
   ├─► Grok API (xAI)
   │   • NLP processing
   │   • Context analysis
   │   • Generate recommendations
   │
   ├─► Edge Function (format response)
   │   • Parse Grok output
   │   • Add metadata
   │   • Return JSON
   │
   ├─► use-grok Hook (parse)
   │   • Handle success/error
   │   • Update loading state
   │   • Return recommendations
   │
   ├─► AIChatbot Display
   │   • Show bot message
   │   • Highlight Grok badge
   │   • Add suggestion buttons
   │
   ▼
User sees: "Here are 4 gift recommendations..."
```

### 2. Shopping Flow

```
User Actions:

1. BROWSE
   Home → Category Grid → Select Category
        → Catalog Page → Browse Products
        → Product Card → View Details

2. ADD TO CART
   Product Page → Quantity → Add to Cart Button
        → CartContext (update state)
        → Navbar Badge (show count)

3. CHECKOUT
   Cart → Proceed to Checkout
        → Checkout Form (address, payment)
        → Order Summary → Place Order
        → Success → Order Page

4. TRACK
   Orders → View Order Status
        → Timeline with tracking steps
        → Order History
```

### 3. Authentication Flow

```
User (Unauthenticated)
   │
   ├─► Click Login/Register
   │
   ├─► AuthPage (Tabs)
   │   • Sign In tab
   │   • Create Account tab
   │
   ├─► Form Submission
   │   • Email/Password validation
   │   • Supabase Auth
   │
   ├─► Auth Context Update
   │   • Set user state
   │   • Store session
   │
   ├─► Navigate to Home
   │   • AuthContext shows user info
   │   • Navbar shows user avatar
   │   • Protected routes accessible
   │
   ▼
User (Authenticated)
```

## Component Hierarchy

```
App
├── AuthProvider
│   └── CartProvider
│       ├── Navbar
│       │   ├── Logo/Branding
│       │   ├── Navigation Links
│       │   ├── Search Bar
│       │   ├── Cart Icon
│       │   └── User Menu
│       │
│       ├── Main Content
│       │   ├── HomePage
│       │   │   ├── Hero Section
│       │   │   ├── AI Gift Finder
│       │   │   ├── Categories Grid
│       │   │   ├── Product Tabs
│       │   │   ├── AI Banner
│       │   │   ├── Testimonials
│       │   │   └── Stats
│       │   │
│       │   ├── CatalogPage
│       │   │   ├── Header
│       │   │   ├── Filters Sidebar
│       │   │   │   ├── AI Gift Finder
│       │   │   │   ├── Categories
│       │   │   │   ├── Price Range
│       │   │   │   └── Occasions
│       │   │   ├── Product Grid
│       │   │   └── Sorting/View Options
│       │   │
│       │   ├── ProductDetailPage
│       │   │   ├── Breadcrumb
│       │   │   ├── Product Image + Badges
│       │   │   ├── Details Section
│       │   │   ├── Quantity + CTA
│       │   │   ├── Delivery Info
│       │   │   ├── Tabs (Description/Reviews)
│       │   │   └── Related Products
│       │   │
│       │   ├── CartPage
│       │   │   ├── Cart Items List
│       │   │   └── Order Summary
│       │   │
│       │   ├── CheckoutPage
│       │   │   ├── Address Form
│       │   │   ├── Payment Method
│       │   │   └── Order Summary
│       │   │
│       │   ├── AuthPage
│       │   │   ├── Sign In Tab
│       │   │   └── Create Account Tab
│       │   │
│       │   └── OrdersPage
│       │       ├── Order List
│       │       └── Tracking Timeline
│       │
│       ├── Footer
│       │   ├── Brand Info
│       │   ├── Links
│       │   ├── Contact Info
│       │   └── Socials
│       │
│       └── AIChatbot (Fixed Position)
│           ├── Toggle Button
│           └── Chat Interface
│               ├── Message History
│               ├── Input Field
│               └── Suggestions
```

## State Management

```
Context Providers
├── AuthContext
│   ├── user (User | null)
│   ├── isAuthenticated (boolean)
│   ├── login(email, password)
│   ├── register(name, email, password)
│   └── logout()
│
└── CartContext
    ├── items (CartItem[])
    ├── addItem(product, quantity)
    ├── removeItem(productId)
    ├── updateQuantity(productId, quantity)
    ├── clearCart()
    ├── totalItems (number)
    └── totalPrice (number)

React Hooks (Component State)
├── useState (form inputs, UI state)
├── useRef (scroll targets, inputs)
├── useEffect (side effects, scroll behavior)
├── useNavigate (routing)
├── useSearchParams (URL query params)
└── useGrok (AI recommendations)
```

## API Integration Points

```
Frontend API Calls
│
├─► Supabase Auth
│   POST /auth/v1/signup
│   POST /auth/v1/token
│   GET /auth/v1/user
│   POST /auth/v1/logout
│
├─► Supabase Edge Functions
│   POST /functions/v1/grok-recommendations
│   ├── Body: { query, occasion?, budget? }
│   └── Returns: { success, recommendation, ... }
│
└─► Razorpay (via Checkout)
    POST https://api.razorpay.com/v1/orders
    (Handled server-side when possible)
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    PRODUCTION                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  CDN / Static Hosting                           │   │
│  │  (Vercel, Netlify, etc.)                        │   │
│  │                                                  │   │
│  │  ├─ dist/index.html (SPA entry)                 │   │
│  │  ├─ dist/assets/*.js (bundles)                  │   │
│  │  ├─ dist/assets/*.css (styles)                  │   │
│  │  └─ public/* (images)                           │   │
│  └────────────┬──────────────────────────────────┘   │
│               │                                        │
│  ┌────────────▼──────────────────────────────────┐   │
│  │  Supabase Project                            │   │
│  │                                               │   │
│  │  ├─ PostgreSQL Database                       │   │
│  │  ├─ Auth System                               │   │
│  │  ├─ Edge Functions                            │   │
│  │  │  └─ grok-recommendations                   │   │
│  │  └─ Storage (Images)                          │   │
│  └─────────────────────────────────────────────┘   │
│               │                                        │
│  ┌────────────▼──────────────────────────────────┐   │
│  │  External APIs                               │   │
│  │                                               │   │
│  │  ├─ Grok API (xAI)                            │   │
│  │  └─ Razorpay API                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Security Layers

```
Frontend Security
├── Input Validation
│   └── Form validation via react-hook-form + zod
├── CORS Protection
│   └── Configured in Edge Function
└── Auth State Management
    └── Context-based session

Backend Security
├── API Key Management
│   └── Grok API key in Supabase secrets (never exposed)
├── Row Level Security (RLS)
│   └── Database-level access control
├── JWT Verification
│   └── Supabase handles auth
└── Error Sanitization
    └── Don't expose internal errors to client

Data Protection
├── HTTPS/TLS
│   └── All traffic encrypted
├── Password Hashing
│   └── Supabase Auth handles
└── Rate Limiting
    └── Applied at Edge Function level
```

---

This architecture ensures:
- ✅ Scalability (serverless functions, CDN)
- ✅ Security (API keys hidden, RLS ready)
- ✅ Performance (optimized builds, edge computing)
- ✅ Maintainability (clear separation of concerns)
- ✅ User Experience (fast loads, smooth interactions)
