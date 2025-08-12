import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 102 125"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="50" height="50" fill="#92D050" />
    <rect x="52" width="50" height="50" fill="#F79646" />
    <rect y="52" width="50" height="50" fill="#C00000" />
    <rect x="52" y="52" width="50" height="50" fill="#00B0B0" />
    <text
      x="25"
      y="25"
      fontFamily="Arial, sans-serif"
      fontSize="30"
      dy=".3em"
      fill="white"
      textAnchor="middle"
    >
      T
    </text>
    <text
      x="77"
      y="25"
      fontFamily="Arial, sans-serif"
      fontSize="30"
      dy=".3em"
      fill="white"
      textAnchor="middle"
    >
      P
    </text>
    <text
      x="25"
      y="77"
      fontFamily="Arial, sans-serif"
      fontSize="30"
      dy=".3em"
      fill="white"
      textAnchor="middle"
    >
      I
    </text>
    <text
      x="77"
      y="77"
      fontFamily="Arial, sans-serif"
      fontSize="30"
      dy=".3em"
      fill="white"
      textAnchor="middle"
    >
      S
    </text>
    <text
      x="51"
      y="115"
      fontFamily="Arial, sans-serif"
      fontSize="14"
      fill="white"
      textAnchor="middle"
      letterSpacing="1"
    >
      TIPS UNIX
    </text>
  </svg>
);