// frontend/src/components/ui/ReusableDialog.jsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * A reusable dialog component built with shadcn/ui
 * This can be used throughout the application for consistent dialog/modal UI
 */
const ReusableDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeText = "Close",
  showClose = true,
  onClose,
}) => {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}

        <div className="py-4">{children}</div>

        <DialogFooter className="flex justify-between items-center">
          {footer ? (
            footer
          ) : (
            showClose && (
              <DialogClose asChild>
                <Button variant="outline" onClick={handleClose}>
                  {closeText}
                </Button>
              </DialogClose>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReusableDialog;