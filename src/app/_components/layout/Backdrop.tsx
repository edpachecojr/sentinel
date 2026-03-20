import { useSidebar } from "@/context/SidebarContext";
import React from "react";
import { cn } from "@/app/_lib/utils";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 bg-gray-900/50 lg:hidden transition-opacity duration-300",
        isMobileOpen ? "animate-in fade-in opacity-100" : "animate-out fade-out opacity-0"
      )}
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
