import { ModaApi } from './contracts';
import { createDemoApi } from './demoStore';
import { createHttpApi } from './createHttpApi';

export const apiMode = (import.meta.env.VITE_API_MODE || 'demo') as 'demo' | 'http';

export const modaApi: ModaApi = apiMode === 'demo' ? createDemoApi() : createHttpApi();
export type { ModaWorkspace } from './contracts';
