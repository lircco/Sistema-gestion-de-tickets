import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('handles conditional classes', () => {
    expect(cn('btn', true && 'active', false && 'hidden')).toBe('btn active');
  });

  it('merges tailwind classes correctly', () => {
    // twMerge logic: px-2 and px-4 should result in px-4
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
