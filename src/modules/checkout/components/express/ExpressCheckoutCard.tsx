import { ReactNode } from "react";

interface ExpressCheckoutCardProps {
  title: string;
  isActive: boolean;
  isDone: boolean;
  path?: string;
  children: ReactNode;
}

export const ExpressCheckoutCard = ({
  title,
  isActive,
  isDone,
  path,
  children,
}: ExpressCheckoutCardProps) => {
  const baseClasses = "bg-white rounded-lg p-6 shadow-sm border transition-all duration-300";
  const activeClasses = "border-black shadow-md";
  const inactiveClasses = "border-gray-200 hover:border-gray-300";
  const contentClasses = "transition-all duration-300";
  const contentActiveClass = "opacity-100";
  const contentInactiveClass = "opacity-50";

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          {title}
          {isDone && (
            <span className="text-black">
              ✓
            </span>
          )}
        </h2>
        {path && !isActive && (
          <a
            href={path}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Edit
          </a>
        )}
      </div>

      <div className={`${contentClasses} ${isActive ? contentActiveClass : contentInactiveClass}`}>
        {children}
      </div>
    </div>
  );
};
