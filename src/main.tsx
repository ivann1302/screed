import { ViteSSG } from 'vite-ssg/single-page';
import App from './App';
import './styles/index.css';

export const createApp = ViteSSG(App);
