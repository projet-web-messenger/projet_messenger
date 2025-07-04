"use client";

import { useCallback, useEffect, useState } from "react";
import { useCallbackRef } from "./use-callback-ref";

export interface UseDisclosureProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onClose?(): void;
  onOpen?(): void;
  openDelay?: number;
  closeDelay?: number;
}

const getDelay = (openDelay: number, closeDelay: number, openState: boolean, openProp?: boolean) => {
  if (openProp !== undefined) {
    return openProp ? openDelay : closeDelay;
  }
  return openState ? openDelay : closeDelay;
};

/**
 * `useDisclosure` is a custom hook used to help handle common open, close, or toggle scenarios.
 * It can be used to control feedback component such as `Modal`, `AlertDialog`, `Drawer`, etc.
 *
 */
export function useDisclosure(props: UseDisclosureProps = {}) {
  const { onClose: onCloseProp, onOpen: onOpenProp, isOpen: openProp, openDelay = 0, closeDelay = 0 } = props;

  const handleOpen = useCallbackRef(onOpenProp);
  const handleClose = useCallbackRef(onCloseProp);

  const [openState, setOpen] = useState(props.defaultOpen || false);
  const [isOpen, setIsOpen] = useState(openProp !== undefined ? openProp : openState);

  const isControlled = openProp !== undefined;

  const onClose = useCallback(() => {
    if (!isControlled) {
      setOpen(false);
    }
    handleClose?.();
  }, [isControlled, handleClose]);

  const onOpen = useCallback(() => {
    if (!isControlled) {
      setOpen(true);
    }
    handleOpen?.();
  }, [isControlled, handleOpen]);

  const onToggle = useCallback(() => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  }, [isOpen, onOpen, onClose]);

  useEffect(() => {
    const delay = getDelay(openDelay, closeDelay, openState, openProp);
    const timeout = setTimeout(() => {
      setIsOpen(openProp !== undefined ? openProp : openState);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [openProp, openState, openDelay, closeDelay]);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
}

export type UseDisclosureReturn = ReturnType<typeof useDisclosure>;
