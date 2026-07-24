# Produit Academy - GATE Platform

This is a specialized platform dedicated to GATE preparation, providing mock tests, PDF materials, and engineering subject resources.

## Features
- **Mock Tests**: GATE simulation environment with complex latex rendering for equations.
- **Mobile Compatibility**: Wrapped with Capacitor for Android deployment.
- **PDF Viewing**: Built-in support for reading study materials.

## Tech Stack
- Next.js 15 (Turbopack)
- React 19
- Capacitor (for mobile apps)
- KaTeX (for mathematical formulas)
- React-PDF (for document rendering)
- Swiper (for touch sliders)

## Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server (uses Turbopack):
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Capacitor Mobile Build
To build for Android:
```bash
npm run build
npx cap sync android
npx cap open android
```
