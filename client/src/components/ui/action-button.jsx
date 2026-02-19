import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
const defaultMessages = {
  view: { success: 'Details loaded', pending: 'Loading...' },
  edit: { success: 'Edit mode enabled', pending: 'Opening editor...' },
  delete: { success: 'Deleted successfully', pending: 'Deleting...' },
  create: { success: 'Created successfully', pending: 'Creating...' },
  update: { success: 'Updated successfully', pending: 'Updating...' },
  export: { success: 'Export completed', pending: 'Exporting...' },
  import: { success: 'Import completed', pending: 'Importing...' },
  download: { success: 'Download started', pending: 'Downloading...' },
  upload: { success: 'Upload completed', pending: 'Uploading...' },
  approve: { success: 'Approved successfully', pending: 'Approving...' },
  reject: { success: 'Rejected', pending: 'Processing...' },
  submit: { success: 'Submitted successfully', pending: 'Submitting...' },
  cancel: { success: 'Cancelled', pending: 'Cancelling...' },
  send: { success: 'Sent successfully', pending: 'Sending...' },
  reset: { success: 'Reset completed', pending: 'Resetting...' },
  refresh: { success: 'Refreshed', pending: 'Refreshing...' },
  sync: { success: 'Synced successfully', pending: 'Syncing...' },
  lock: { success: 'Locked', pending: 'Locking...' },
  unlock: { success: 'Unlocked', pending: 'Unlocking...' },
  activate: { success: 'Activated', pending: 'Activating...' },
  deactivate: { success: 'Deactivated', pending: 'Deactivating...' },
  coming: { success: 'Coming soon', pending: 'Coming soon...' },
  custom: { success: 'Action completed', pending: 'Processing...' }
};
const ActionButton = React.forwardRef(
  ({
    actionType = 'custom',
    actionLabel,
    actionContext,
    messages,
    onAction,
    onClick,
    showLoading = true,
    noSuccessToast = false,
    disabled,
    children,
    className,
    ...props
  }, ref) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const handleClick = React.useCallback(async (e) => {
      // Handle simple onClick
      if (onClick && !onAction) {
        onClick(e);
        return;
      }
      // Handle actionType='coming' for placeholder features
      if (actionType === 'coming') {
        toast.info(actionLabel || 'Coming Soon', {
          description: actionContext ? `${actionContext} is coming soon` : 'This feature is coming soon'
        });
        return;
      }
      // Handle async action
      if (onAction) {
        const msgs = { ...defaultMessages[actionType], ...messages };
        const label = actionLabel || actionType.charAt(0).toUpperCase() + actionType.slice(1);
        const context = actionContext ? ` - ${actionContext}` : '';
        try {
          setIsLoading(true);
          await onAction();
          if (!noSuccessToast) {
            if (actionType === 'reject' || actionType === 'lock' || actionType === 'delete') {
              toast.warning(label, { description: `${msgs.success}${context}` });
            } else {
              toast.success(label, { description: `${msgs.success}${context}` });
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          toast.error(label, { description: `${errorMessage}${context}` });
        } finally {
          setIsLoading(false);
        }
      }
    }, [onClick, onAction, actionType, actionLabel, actionContext, messages, noSuccessToast]);
    return (
      <Button
        ref={ref}
        className={cn(className)}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}>
        {showLoading && isLoading ?
        <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </> :
        children
        }
      </Button>);
  }
);
ActionButton.displayName = "ActionButton";
export { ActionButton };