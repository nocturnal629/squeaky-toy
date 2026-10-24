# 🐼 Squeaky Panda

A mobile-first Next.js (App Router) toy: shake your phone (or tap) and the panda squeaks.
Built with TypeScript, Tailwind CSS v4 and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. On desktop, click the toy.
To test shaking on a phone, deploy to Vercel (motion sensors require HTTPS).

## 1. Add the sound

Place your sound file at `public/squeak.mp3` (the code loads `/squeak.mp3`).

## 2. Initialize the GitHub repo

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

## 3. Deploy to Vercel

1. Go to https://vercel.com/new and import the GitHub repo.
2. Framework preset is auto-detected as **Next.js**. Leave defaults and click **Deploy**.
3. Every push to `main` now deploys automatically; other branches get preview URLs.

## How it works

- `useShakeDetection` listens to `devicemotion` and fires when the change in acceleration exceeds an adjustable threshold (Sensitivity link in the UI). iOS needs `DeviceMotionEvent.requestPermission()` from a user gesture.
- `PermissionModal` runs that request and also resumes the Web Audio context, which browsers only allow after a gesture.
- Audio is decoded once with the Web Audio API, with a 200 ms debounce and a random playback-rate (0.9–1.15) for pitch variation.
- Tapping the toy is the fallback if motion is denied or unsupported.

## Customizing the toy

The panda is inline SVG in `src/components/Toy.tsx`. To use your own artwork, put it at `public/panda.png` and replace the `<motion.svg>` with an `<img src="/panda.png" />`.
