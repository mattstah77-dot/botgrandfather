import { type ReactNode } from 'react';
import { Navigation } from './Navigation';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <main>{children}</main>
      <Navigation />
    </div>
  );
}
