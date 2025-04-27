import { Global, css } from '@emotion/react';
import React from 'react';

const globalStyles = css`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    transition: all 0.3s ease-in-out;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    background-color: #FFFFFF;
    color: #1A1A1A;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1rem;
    line-height: 1.2;
    font-weight: 600;
    animation: slideIn 0.5s ease-out;
  }

  p {
    margin-bottom: 1rem;
    color: #333333;
  }

  a {
    color: #007ACC;
    text-decoration: none;
    transition: color 0.2s ease;
    &:hover {
      color: #005c99;
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  .page-container {
    animation: fadeIn 0.5s ease-out;
  }

  .card {
    background-color: #E6F2FF;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    animation: scaleIn 0.3s ease-out;
  }

  .input-field {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    background-color: #FFFFFF;
    transition: border-color 0.2s ease;
    &:focus {
      outline: none;
      border-color: #007ACC;
      box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
    }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &.primary {
      background-color: #007ACC;
      color: #FFFFFF;
      &:hover {
        background-color: #005c99;
        transform: translateY(-1px);
      }
    }
    
    &.secondary {
      background-color: #E6F2FF;
      color: #007ACC;
      &:hover {
        background-color: #D6EBFF;
      }
    }
  }

  .icon {
    color: #6B7280;
    transition: color 0.2s ease;
    &:hover {
      color: #007ACC;
    }
  }

  .section {
    padding: 4rem 0;
    &.animated {
      animation: fadeIn 0.5s ease-out;
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
    
    .container {
      padding: 0 1.5rem;
    }
  }
`;

const GlobalStyles: React.FC = () => {
  return <Global styles={globalStyles} />;
};

export default GlobalStyles; 