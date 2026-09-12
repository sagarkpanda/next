import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/lib/site-data";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: {
    default: site.title,
    template: `%s | ${site.title}`,
  },
  description: site.description,
  metadataBase: new URL(site.url),
  authors: [{ name: site.name }],

  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        alt: site.title,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/images/og-image.png"],
  },

  icons: {
    icon: "/images/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <SiteHeader />

        {children}

        <ScrollToTop />

        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </body>
    </html>
  );
}