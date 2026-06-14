import { RouterProvider } from 'react-router';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { router } from './routes';

export default function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <RouterProvider router={router} />
    </FluentProvider>
  );
}
