'use client';

import { Shield, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface EscrowStatusProps {
  status: string;
  releaseDate?: Date | null;
  releaseDue?: Date;
}

export function EscrowStatus({ status, releaseDate, releaseDue }: EscrowStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'In Escrow',
          description: releaseDue 
            ? `Funds will be released on ${new Date(releaseDue).toLocaleDateString()}`
            : 'Awaiting release confirmation'
        };
      case 'RELEASED':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Released',
          description: releaseDate 
            ? `Released on ${new Date(releaseDate).toLocaleDateString()}`
            : 'Funds have been released to seller'
        };
      case 'DISPUTED':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Disputed',
          description: 'This transaction is under dispute'
        };
      case 'REFUNDED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Refunded',
          description: releaseDate 
            ? `Refunded on ${new Date(releaseDate).toLocaleDateString()}`
            : 'Funds have been refunded'
        };
      default:
        return {
          icon: Shield,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const { icon: Icon, color, bgColor, borderColor, label, description } = getStatusConfig();

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <Icon className={`w-8 h-8 ${color}`} />
      <div>
        <h4 className={`font-semibold ${color}`}>{label}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}