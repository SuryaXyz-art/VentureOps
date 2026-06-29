# Contributing

Thanks for helping improve VentureOps Autopilot.

## Local Setup

```bash
npm install
npm run dev
```

## Quality Checks

Run these before submitting changes:

```bash
npm run lint
npm run policy:test
npm run build
```

## Guidelines

- Keep demo mode deterministic and safe without API keys.
- Label simulated, demo, Stripe test mode, and future production behavior clearly.
- Never commit secrets or real customer/payment data.
- Preserve policy-first spend evaluation before any agent spend action.
- Keep UI changes polished, responsive, and judge-readable.

## Pull Request Checklist

- Build passes.
- New routes have empty/loading/error states where relevant.
- README or skill docs are updated when behavior changes.
- No `.env` or secret values are committed.
