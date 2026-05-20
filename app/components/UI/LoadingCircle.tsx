import React from "react";

interface LoadingCircleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingCircle({ size = "md", className = "" }: LoadingCircleProps) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-[3px]",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-gray-200 border-t-black animate-spin`}
        style={{ borderRadius: "50%" }}
      />
    </div>
  );
}
