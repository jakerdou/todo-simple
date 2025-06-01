// Helper function to format a date string in a readable format
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  
  // Format options
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  // Only show year if it's not the current year
  const currentYear = new Date().getFullYear();
  if (date.getFullYear() === currentYear) {
    options.year = undefined;
  }
  
  return date.toLocaleDateString(undefined, options);
}
