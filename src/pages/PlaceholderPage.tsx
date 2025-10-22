import React from 'react';
import { APP_NAME } from '@/lib/constants';
interface PlaceholderPageProps {
  pageName: string;
}
export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ pageName }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-card border rounded-lg shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{pageName}</h1>
          <p className="mt-4 text-lg text-muted-foreground">This page is under construction.</p>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon for updates!</p>
          <div className="mt-8 text-sm text-muted-foreground/50">
            {APP_NAME}
          </div>
        </div>
      </div>
    </div>
  );
};