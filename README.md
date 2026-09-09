<div align="center">
  <img src="public/logo-emerald-light.png" alt="MEC Computer Club Logo" width="120" />
  <h1>MEC Computer Club Web Platform</h1>
  <p><strong>The official web application and digital portal for the MEC Computer Club (MEC-CC).</strong></p>
  <p>
    Built with modern web technologies to empower student programmers, showcase real projects, manage competitive programming tracks, host tournaments, and issue verifiable digital credentials.
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#environment-variables">Environment Variables</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#license">License</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15%2B-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square&logo=vercel" alt="Vercel" />
  </p>
</div>

---

## 🚀 Overview

The **MEC Computer Club Platform** is a full-featured, enterprise-grade university club management system and community portal. It bridges the gap between club executives, active members, and general students through automated workflows, interactive competitive programming tools, dynamic event registrations, and digital certificate verification.

---

## ✨ Features

### 🌐 Public Portal
- **Interactive Home Experience**: Hero event queue, club statistics, upcoming workshops, featured projects, and sponsor showcase.
- **CP Arena & Competitive Programming Hub**:
  - Live competitive programming leaderboard.
  - Curated problem sets, roadmaps, tutorials, and mentorship session booking.
- **Projects Directory**: Showcase of student-led software, open-source tools, and research projects with repository links and live demos.
- **Events & Gaming Tournaments**:
  - Dedicated event landing pages with schedules, prize pools, rules, and sponsor tier recognition.
  - Multi-mode registration: Individual registrations or Squad/Team registrations (e.g. 4-player FreeFire/esports squads) with automated roster tracking.
- **Technical Blog**: Club articles, tech tutorials, and editorial submissions with category filtering and read-time estimates.
- **Alumni & Executive Roster**: Interactive hierarchy directory of faculty advisors, executive panels, and past club leaders.
- **Public Certificate Verification Portal (`/verify?cert=...`)**:
  - Instant cryptographic-style credential check against issued certificate IDs.
  - High-fidelity visual rendering and pixel-perfect print/PDF export.

### 👤 Member Dashboard
- **Personalized Profile**: Customizable member cards, avatar framing, cover presets, bio, and social/GitHub links.
- **My Credentials**: Access to all issued participation and achievement certificates.
- **Event Registrations**: Real-time status tracking for pending and approved registrations.

### 🛡️ Admin & Moderator Console
- **Event Operations**: Full lifecycle event creation, schedule builders, prize rewards, sponsor linking, and attendee roster approvals.
- **Dual-Mode Certificate Engine**:
  - **Visual Builder**: Custom theme builder with customizable borders, ornate seals, and multi-signatory layouts.
  - **Custom HTML/CSS Engine**: Monospace template editor supporting custom HTML files, live side-by-side preview, and dynamic Mustache placeholders (`{{recipient_name}}`, `{{event_title}}`, `{{certificate_id}}`, etc.).
  - **Single & Mass Bulk Issuance**: Issue credentials individually or to 100+ event participants in one click.
- **Form Builder**: Custom registration forms with dynamic field validation, response tables, and CSV exports.
- **Member & Role Management**: Approval of new applicants, role designation, and secure invitation code generation.
- **CMS & Page Content Customizer**: Update club announcements, hero banners, and contact information without code changes.

### 🎨 Neo-Brutalist Design System
- Custom neo-brutalist theme featuring crisp high-contrast borders, bold drop shadows, and responsive dark/light modes.
- Six dynamic accent vibes: **Emerald**, **Lime**, **Cyan**, **Violet**, **Amber**, and **Coral**.
- Unified Custom Select & Dropdown design system adhering to strict accessibility and theme guidelines.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom CSS Design System
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/) with centralized interceptors & base URL handling
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Document & Media Export**: [html2canvas](https://html2canvas.hertzen.com/) & [jspdf](https://github.com/parallax/jsPDF)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or higher
- **npm** / **yarn** / **pnpm**
- Running instance of the [MEC-CC Backend API](https://github.com/meccomputerclub/mecComputerClubWebsite-backend)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/meccomputerclub/mec-cc-frontend.git
   cd mec-cc-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your local settings:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔐 Environment Variables

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | Root URL of the backend REST API (without trailing slash) | `https://api.example.com` or `http://localhost:4000` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary cloud name for direct client media optimization | `dj1sjgitq` |

> [!NOTE]
> Never commit `.env` or `.env.local` files containing live credentials to version control. Configure these variables securely within your hosting provider's dashboard.

---

## 🚢 Deployment (Vercel)

This frontend is optimized for zero-config deployment on **Vercel**:

1. Push your code to GitHub.
2. In [Vercel](https://vercel.com/), click **Add New Project** and import `meccomputerclub/mec-cc-frontend`.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://mec-computer-club-website-backend.vercel.app`)
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
4. Click **Deploy**.
5. (Optional) In **Project Settings > Domains**, bind your custom domain (e.g. `meccomputerclub.org`).

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the platform:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m "feat: add some AmazingFeature"`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Developed with ❤️ by the <strong>MEC Computer Club</strong> Technical Team.</sub>
</div>
