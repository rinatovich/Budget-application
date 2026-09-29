import React from 'react';
import {
  ShoppingCart,
  Home,
  Zap,
  Car,
  CreditCard,
  HeartPulse,
  Utensils,
  Film,
  ShoppingBag,
  Shirt,
  GraduationCap,
  Wifi,
  Repeat,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Key,
  Laptop,
  PlusCircle,
  MoreHorizontal,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  Home,
  Zap,
  Car,
  CreditCard,
  HeartPulse,
  Utensils,
  Film,
  ShoppingBag,
  Shirt,
  GraduationCap,
  Wifi,
  Repeat,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Key,
  Laptop,
  PlusCircle,
  MoreHorizontal,
};

interface CategoryIconProps {
  iconName: string;
  color?: string;
  size?: number;
  className?: string;
  withBackground?: boolean;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  color = '#64748b',
  size = 20,
  className = '',
  withBackground = false,
}) => {
  const IconComponent = ICON_MAP[iconName] || DollarSign;

  if (withBackground) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl shrink-0 ${className}`}
        style={{
          width: `${size + 18}px`,
          height: `${size + 18}px`,
          backgroundColor: `${color}18`, // ~10% opacity
          color: color,
        }}
      >
        <IconComponent size={size} strokeWidth={2.2} />
      </div>
    );
  }

  return <IconComponent size={size} strokeWidth={2.2} style={{ color }} className={className} />;
};
