import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  /**
   * Text rendered as the page heading and the last breadcrumb segment.
   */
  pageTitle: string;
  /**
   * When `breadcrumbs` is provided, the component will render a full trail
   * starting from Home. Otherwise it renders Home + `pageTitle`.
   */
  breadcrumbs?: BreadcrumbItem[];
  showNavigation?: boolean;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  breadcrumbs,
  showNavigation = true,
}) => {
  const items: BreadcrumbItem[] = breadcrumbs
    ? [{ label: "Home", href: "/dashboard" }, ...breadcrumbs]
    : [{ label: "Home", href: "/dashboard" }, { label: pageTitle }];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>
      {showNavigation && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li
                  key={`${item.label}-${index}`}
                  className={isLast ? "text-sm text-gray-800 dark:text-white/90" : ""}
                >
                  {isLast || !item.href ? (
                    <span className="text-sm text-gray-800 dark:text-white/90">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                      href={item.href}
                    >
                      {item.label}
                      <svg
                        className="stroke-current"
                        width="17"
                        height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                          stroke=""
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </div>
  );
};

export default PageBreadcrumb;
