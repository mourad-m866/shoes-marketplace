This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Activation email

The Sanity Studio's **إرسال رسالة التفعيل للعارض** action sends email through Gmail SMTP. Configure these environment variables in Vercel (and in `.env.local` for local testing):

- `GMAIL_USER`: the Gmail account used to send activation emails.
- `GMAIL_APP_PASSWORD`: an app password generated for that account after enabling 2-Step Verification. Do not use the account's regular password.
- `NEXT_PUBLIC_SITE_URL` (recommended): the public site URL, for example `https://example.com`. If omitted, the app uses Vercel's deployment URL or the current request origin.

The email is sent only for a published, approved activation request whose activation code matches the request. Gmail sending quotas and spam filtering still apply.
