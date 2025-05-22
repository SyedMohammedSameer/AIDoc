
import React from 'react';
import { GENERAL_DISCLAIMER, EMERGENCY_DISCLAIMER } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-lighttext p-6 text-center mt-12">
      <div className="container mx-auto text-xs">
        <p className="font-semibold mb-2 text-accent">{EMERGENCY_DISCLAIMER}</p>
        <p>{GENERAL_DISCLAIMER}</p>
        <p className="mt-4">&copy; {new Date().getFullYear()} MediAI Assistant. All rights reserved.</p>
      </div>
    </footer>
  );
};
    