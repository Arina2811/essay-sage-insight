
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

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
    <div className={`p-4 rounded-md ${isActive ? 
      (isPrimary ? "bg-green-50/20 border border-green-100" : 
      (isFallback ? "bg-blue-50/20 border border-blue-100" : "bg-muted")) 
      : "bg-muted"}`}>
      <div className="flex items-start justify-between">
        <h4 className="font-medium mb-2">{title}</h4>
        <div className="flex gap-1">
          {isActive && (
            <div className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3" />
              {isPrimary ? "Primary" : isFallback ? "Fallback" : "Active"}
            </div>
          )}
          {!isActive && (
            <div className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-gray-100 text-gray-800">
              <XCircle className="h-3 w-3" />
              Inactive
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-2">
        <div 
          className={`
            ${isActive 
              ? "bg-green-500/20 text-green-700" 
              : "bg-muted-foreground/20 text-muted-foreground"
            } text-xs px-2 py-1 rounded-full flex items-center gap-1`}
        >
          <CheckCircle className="h-3 w-3" />
          Status: {isActive ? "Active" : "Inactive"}
        </div>
        
        <div 
          className={`${
            keyRequired 
              ? (keyConfigured 
                ? "bg-green-500/20 text-green-700" 
                : "bg-amber-500/20 text-amber-700")
              : "bg-green-500/20 text-green-700"
          } text-xs px-2 py-1 rounded-full flex items-center gap-1`}
        >
          {keyRequired 
            ? (keyConfigured 
              ? <CheckCircle className="h-3 w-3" /> 
              : <XCircle className="h-3 w-3" />) 
            : <CheckCircle className="h-3 w-3" />}
          
          {keyRequired 
            ? (keyConfigured ? "API Key Configured" : "API Key Required") 
            : "No API Key Required"}
        </div>
      </div>
    </div>
  );
};
