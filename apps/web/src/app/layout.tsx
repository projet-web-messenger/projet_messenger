import { ThemeProvider } from "@/providers/theme";
import { Container } from "@repo/ui/layout/container";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ReactScan } from "./react-scan";
import "@/styles/globals.css";
import { ApolloProviderWrapper } from "@/providers/apollo-provider";

export const metadata: Metadata = {
  title: "Messenger Appli",
  description: "Application de messagerie en temps réel",
};

const quicksand = localFont({
  src: "../../public/static/assets/fonts/Quicksand.woff2",
  variable: "--font-quicksand",
  display: "swap",
});

export default function RootLayout({ children }: Readonly<React.PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${quicksand.variable} antialiased`}>
        <ReactScan />
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Container className="max-w-screen-md duration-moderate">
            <ApolloProviderWrapper>{children}</ApolloProviderWrapper>
          </Container>
        </ThemeProvider>
      </body>
    </html>
  );
}
