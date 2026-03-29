# Risk Command — Risk dashboard (React)

Risk register with **FMEA (RPN)** and a **5×5 probability–impact matrix**, **Chart.js** visuals, **browser localStorage**, **CSV export**, **print/PDF**, and **presentation mode**.

**No Claude / no cloud AI.** “Quick-fill from context” builds **five draft risks** locally from your text using a **deterministic hash** over a template library — **different text → different risks and scores**.

## Two numbers explained

| What | Meaning | Scale |
|------|---------|--------|
| **P×I (matrix score)** | How likely × how bad (inherent risk on the heat map) | Probability & Impact each **1–5** → score **1–25** |
| **RPN (FMEA)** | Failure-mode ranking: severity × how often × how detectable | Severity, Occurrence, Detection each **1–10** → **RPN up to 1000** |

They answer different questions and **are not comparable** on one axis — the UI uses **two separate bar charts** plus a short “Why two numbers?” panel.

## Quick start

```bash
npm install
npm run dev
```

- **UI:** http://localhost:5173 (Vite proxies `/api` to the Express server on **3000**)
- **Production:** `npm run build` then `npm start` → http://localhost:3000

## Stack

- React (Vite), Tailwind, Chart.js  
- Data: `localStorage` key `rms_risk_register_v2`  
- Express: static build + `/api/health` only (no AI endpoints)

## License

MIT
