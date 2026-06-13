import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart AI Document Insights",
  description: "AI document intelligence platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  accent: {
                    50: "#eef2ff", 100: "#e0e7ff",
                    200: "#c7d2fe", 300: "#a5b4fc",
                    400: "#818cf8", 500: "#6366f1",
                    600: "#4f46e5", 700: "#4338ca",
                    800: "#3730a3", 900: "#312e81",
                  },
                  slate: {
                    50: "#f8fafc", 100: "#f1f5f9",
                    200: "#e2e8f0", 300: "#cbd5e1",
                    400: "#94a3b8", 500: "#64748b",
                    600: "#475569", 700: "#334155",
                    800: "#1e293b", 900: "#0f172a",
                    950: "#020617",
                  },
                },
                borderRadius: {
                  xl: "0.75rem",
                  "2xl": "1rem",
                },
                boxShadow: {
                  card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
                  "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
                },
              },
            },
          };
        ` }} />
      </head>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">{children}</body>
    </html>
  );
}
