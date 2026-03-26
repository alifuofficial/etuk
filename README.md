<div align="center">

# ⚡ ETUK - Electric 3-Wheeler

### Ethiopia's Premier Electric Vehicle Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

**Agent Recruitment & Management Platform for Soreti International Trading**

[Live Demo](#) · [Report Bug](https://github.com/alifuofficial/etuk/issues) · [Request Feature](https://github.com/alifuofficial/etuk/issues)

</div>

---

## 📖 About

ETUK is a comprehensive web platform for Soreti International Trading, Ethiopia's leading electric 3-wheeler importer and assembler. This platform handles:

- **Public Website** - Showcasing ETUK electric vehicles
- **Agent Recruitment** - Multi-step application form for potential agents
- **Admin Dashboard** - Complete management system for applications and users
- **Multi-language Support** - English, Amharic (አማርኛ), and Afaan Oromoo

---

## ✨ Features

### 🌐 Public Website
- Modern dark theme with electric/neon design
- Animated hero section with particle effects
- Product specifications showcase
- Multi-language support (EN/AM/OR)
- Mobile-responsive design

### 📝 Agent Registration (`/become-agent`)
- Multi-step application form (4 steps)
- Progress indicator
- Ethiopian regions & cities dropdown
- Form validation
- Social media optimized (Open Graph)

### 🔐 Admin Dashboard (`/admin`)
- **Dashboard** - Statistics and recent applications
- **Agent Management** - Approve/reject applications
- **User Management** - Create/edit admin users
- **Products** - Manage product catalog

### 👥 User Roles
| Role | Permissions |
|------|-------------|
| Admin | Full access, user management |
| Marketing Manager | Dashboard, agent management |
| Marketing Officer | Dashboard, agent management |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM (SQLite)
- **Auth:** NextAuth.js v4
- **State:** Zustand + TanStack Query
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alifuofficial/etuk.git
   cd etuk
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```env
   DATABASE_URL="file:./db/custom.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   bun run db:push
   bun run db:generate
   ```

5. **Seed the database**
   ```bash
   bun prisma/seed.ts
   ```

6. **Start the development server**
   ```bash
   bun run dev
   ```

7. **Open in browser**
   Navigate to `http://localhost:3000`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@etuk.et | admin123 |
| Marketing Manager | manager@etuk.et | manager123 |
| Marketing Officer | officer@etuk.et | officer123 |

---

## 📁 Project Structure

```
etuk/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── admin/         # Admin panel pages
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication
│   │   ├── become-agent/  # Agent registration
│   │   └── page.tsx       # Homepage
│   ├── components/
│   │   ├── public/        # Public components
│   │   ├── admin/         # Admin components
│   │   └── ui/            # UI components (shadcn)
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── db.ts          # Prisma client
│   │   └── i18n/          # Internationalization
│   └── translations/      # Language files
└── public/                # Static assets
```

---

## 🌍 Supported Languages

| Language | Code | Native |
|----------|------|--------|
| English | `en` | English |
| Amharic | `am` | አማርኛ |
| Afaan Oromoo | `or` | Afaan Oromoo |

---

## 📊 Database Models

- **User** - Admin panel users
- **Agent** - Agent applications
- **Product** - Product catalog
- **Region** - Ethiopian regions
- **City** - Cities per region
- **ActivityLog** - Audit trail
- **Setting** - App settings

---

## 🎨 Design System

### Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Cyan | `#00ffff` | Primary |
| Electric Blue | `#0891b2` | Secondary |
| Dark | `#000000` | Background |
| Light Cyan | `#22d3ee` | Accents |

### Typography
- **Font:** Geist Sans
- **Weights:** 400, 500, 600, 700, 900

---

## 📱 Screenshots

### Homepage
Modern dark theme with electric neon effects and animated particles.

### Agent Registration
Multi-step form with progress indicator and validation.

### Admin Dashboard
Statistics, charts, and agent management interface.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software for Soreti International Trading.

---

## 📞 Contact

**Soreti International Trading**
- Location: Modjo, Oromia, Ethiopia
- Brand: ETUK Electric 3-Wheelers

---

<div align="center">

**Built with ❤️ for Ethiopia's Electric Future**

[⬆ Back to Top](#-etuk---electric-3-wheeler)

</div>
