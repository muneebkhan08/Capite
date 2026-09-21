# Capite Web Studio

This directory contains Capite's Next.js 16 and React 19 web application. It provides the upload flow, caption-style picker, interactive transcript editor, job history, and download interface for the local Flask caption-processing API.

For the project overview and one-command Docker setup, start at the [repository README](../README.md).

## Local development

```bash
npm install
DATABASE_URL="file:./data/captions.db" npx prisma generate
DATABASE_URL="file:./data/captions.db" npx prisma db push
DATABASE_URL="file:./data/captions.db" npm run dev
```

The frontend expects a Flask backend at `http://localhost:5000` by default. Set `BACKEND_URL` for server actions and `NEXT_PUBLIC_BACKEND_URL` for browser-side requests when using a different address.

## Public deployment metadata

For a publicly accessible deployment, set `NEXT_PUBLIC_SITE_URL` to the deployed origin (for example, `https://captions.example.com`). Capite then emits a canonical URL, `robots.txt`, `sitemap.xml`, Open Graph/Twitter metadata, and JSON-LD software and FAQ data. Leave it unset for local and private self-hosted installs so they do not advertise an incorrect canonical URL.

## Validation

```bash
npm run lint
npm run build
```
