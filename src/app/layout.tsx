import { RootProvider } from '../contexts/Root';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <head>
        <title>マルチカウンター</title>

        {/* Favicon の設定 */}
        <link rel="icon" href="/favicon.ico" />

        {/* メタ情報 */}
        <meta charSet="UTF-8" />
        <meta name="description" content="複数のカウンターを一度に操作できるツール" />
      </head>
      <body>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
};

export default RootLayout;
