export const metrics = {
  increment: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[metrics.increment]', ...args);
    }
  },
  gauge: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[metrics.gauge]', ...args);
    }
  },
  histogram: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[metrics.histogram]', ...args);
    }
  },
}; 