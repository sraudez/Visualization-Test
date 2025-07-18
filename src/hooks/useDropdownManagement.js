import { useEffect } from 'react';

export function useDropdownManagement(dropdownOpen, setDropdownOpen, dropdownClass, buttonClass) {
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest(`.${dropdownClass}`) && !e.target.closest(`.${buttonClass}`)) {
        setDropdownOpen(false);
      }
    }
    
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [dropdownOpen, setDropdownOpen, dropdownClass, buttonClass]);
} 