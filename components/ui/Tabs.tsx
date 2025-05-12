'use client';

import React from 'react';

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [activeValue, setActiveValue] = React.useState(defaultValue);

  const onTriggerClick = (value: string) => {
    setActiveValue(value);
  };

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        if (child.type === TabsList) {
          return React.cloneElement(child, { activeValue, onTriggerClick });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ className, children, activeValue, onTriggerClick }: TabsListProps & { activeValue?: string; onTriggerClick?: (value: string) => void }) {
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        if (child.type === TabsTrigger) {
          return React.cloneElement(child, {
            isActive: child.props.value === activeValue,
            onClick: () => onTriggerClick && onTriggerClick(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, className, onClick, children, isActive }: TabsTriggerProps & { isActive?: boolean }) {
  return (
    <button
      type="button"
      className={`${className} ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-white' : ''} rounded-full px-4 py-2 transition-all`}
      onClick={onClick}
      data-state={isActive ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
}
