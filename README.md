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

## Activation contact

Activation requests and seller sign-in use an international WhatsApp phone number. In Sanity Studio, the **فتح واتساب لإرسال رسالة التفعيل** action opens WhatsApp with a prefilled message; an administrator must review and send it.

Enter phone numbers in international format beginning with `+` and the country code. Existing activation requests without a phone number must be updated before they can be activated. The WhatsApp action requires a published, approved request with a valid phone and activation code.

Generate the activation code from the activation request in Sanity Studio. The generator creates a random 12-character code; the exhibition stores its hash automatically when the seller completes registration.

Sellers can upload shoe images from their device as JPEG, PNG, WebP, or AVIF files up to 4 MB.
