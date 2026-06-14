export const metadata = {
  title: "SportEdge AI v4",
  description: "Elite multi-sport betting intelligence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#060612" }}>{children}</body>
    </html>
  );
}
