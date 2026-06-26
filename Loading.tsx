import React from 'react';

export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-700 border-t-transparent"></div>
    </div>
  );
}
