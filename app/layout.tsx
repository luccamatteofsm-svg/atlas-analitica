export const metadata = { title: "Atlas Analítica" };
export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="pt-BR">
      <body>
        <header style={{padding:12,borderBottom:"1px solid #333"}}>ATLAS — MVP</header>
        <main style={{maxWidth:960,margin:"16px auto",padding:16}}>{children}</main>
      </body>
    </html>
  );
}
