import './styles.css';
import './lib/error-capture';
import { startInstance } from './start';

// Minimal client entry to satisfy index.html. The TanStack Start
// runtime and router are configured elsewhere; this file ensures
// Vite can resolve /src/main.jsx without requiring a full client
// bootstrap here.
console.log('frontend client entry loaded', startInstance);
