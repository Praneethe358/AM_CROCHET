// frontend/components/Container.jsx
export default function Container({ children, className = "" }) {
  // Limits page width and adds horizontal padding
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}>
      {children}
    </div>
  );
}
