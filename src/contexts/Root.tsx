import { PropsWithChildren } from 'react';

import { CounterProvider } from './Counter';
import { TargetProvider } from './Target';

export const RootProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <TargetProvider>
      <CounterProvider>
        {children}
      </CounterProvider>
    </TargetProvider>
  );
};
