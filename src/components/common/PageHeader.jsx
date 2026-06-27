export function PageHeader({ title, description, children }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
