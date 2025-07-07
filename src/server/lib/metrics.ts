export const metrics = {
  increment: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[metrics.increment]', ...args);
    }
  },
  gauge: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[metrics.gauge]', ...args);
    }
  },
  histogram: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[metrics.histogram]', ...args);
    }
  },
}; 