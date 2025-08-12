import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 102 102"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="50" height="50" fill="#92D050" />
    <rect x="52" width="50" height="50" fill="#F79646" />
    <rect y="52" width="50" height="50" fill="#C00000" />
    <rect x="52" y="52" width="50" height="50" fill="#00B0B0" />
  </svg>
);