import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-primary text-white hover:bg-blue-700 focus:ring-primary",
      secondary: "bg-secondary text-white hover:bg-slate-800 focus:ring-secondary",
      danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger",
      outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary"
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };

    return (
      <button ref={ref} disabled={disabled || loading} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);