
import React from "react";

interface ModelInfoCardProps {
  title: string;
  description: string;
  isActive: boolean;
  isPrimary?: boolean;
  isFallback?: boolean;
  keyRequired: boolean;
  keyConfigured: boolean;
}

export const ModelInfoCard: React.FC<ModelInfoCardProps> = ({
  title,
  description,
  isActive,
  isPrimary = false,
  isFallback = false,
  keyRequired,
  keyConfigured,
}) => {
  return (
    <div className="bg-muted p-4 rounded-md">
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <div className="flex items-start space-x-2">
        <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
          {isActive 
            ? isPrimary 
              ? "Active - Primary" 
              : isFallback 
                ? "Active - Fallback" 
                : "Active"
            : "Inactive"}
        </div>
        <div 
          className={`${
            keyRequired 
              ? (keyConfigured 
                ? "bg-green-500/20 text-green-500" 
                : "bg-muted-foreground/20 text-muted-foreground")
              : "bg-green-500/20 text-green-500"
          } text-xs px-2 py-1 rounded`}
        >
          {keyRequired 
            ? (keyConfigured ? "Key Configured" : "Key Required") 
            : "No API Key Required"}
        </div>
      </div>
    </div>
  );
};
