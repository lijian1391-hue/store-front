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
  return (
    <div className="jumia-checkout-card">
      <div className="jumia-checkout-card-header">
        <h2 className="jumia-checkout-card-title">
          {title}
          {isDone && (
            <span className="jumia-checkout-card-done">
              ✓
            </span>
          )}
        </h2>
        {path && !isActive && (
          <a
            href={path}
            className="jumia-checkout-card-edit"
          >
            Edit
          </a>
        )}
      </div>

      <div className="jumia-checkout-card-content">
        {children}
      </div>
    </div>
  );
};
