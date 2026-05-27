"use client";

import { useState } from "react";

export function useSidebar(initialOpen = true) {
  const [open, setOpen] = useState(initialOpen);
  const [pinned, setPinned] = useState(true);

  const handleMouseEnter = () => {
    if (!pinned) setOpen(true);
  };

  const handleMouseLeave = () => {
    if (!pinned) setOpen(false);
  };

  const togglePinned = () => {
    const nextPinned = !pinned;
    setPinned(nextPinned);
    setOpen(nextPinned);
  };

  return {
    open,
    pinned,
    handleMouseEnter,
    handleMouseLeave,
    togglePinned,
  };
}