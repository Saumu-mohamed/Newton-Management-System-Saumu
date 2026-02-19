import { useState, useCallback } from 'react';
import { toast } from 'sonner';
const defaultMessages = {
  view: { success: 'Viewing details', error: 'Failed to load details', pending: 'Loading...' },
  edit: { success: 'Edit mode enabled', error: 'Failed to open editor', pending: 'Opening editor...' },
  delete: { success: 'Deleted successfully', error: 'Failed to delete', pending: 'Deleting...' },
  create: { success: 'Created successfully', error: 'Failed to create', pending: 'Creating...' },
  update: { success: 'Updated successfully', error: 'Failed to update', pending: 'Updating...' },
  export: { success: 'Export completed', error: 'Export failed', pending: 'Exporting...' },
  import: { success: 'Import completed', error: 'Import failed', pending: 'Importing...' },
  download: { success: 'Download started', error: 'Download failed', pending: 'Downloading...' },
  upload: { success: 'Upload completed', error: 'Upload failed', pending: 'Uploading...' },
  approve: { success: 'Approved successfully', error: 'Failed to approve', pending: 'Approving...' },
  reject: { success: 'Rejected', error: 'Failed to reject', pending: 'Processing...' },
  submit: { success: 'Submitted successfully', error: 'Failed to submit', pending: 'Submitting...' },
  cancel: { success: 'Cancelled', error: 'Failed to cancel', pending: 'Cancelling...' },
  send: { success: 'Sent successfully', error: 'Failed to send', pending: 'Sending...' },
  reset: { success: 'Reset completed', error: 'Failed to reset', pending: 'Resetting...' },
  refresh: { success: 'Refreshed', error: 'Failed to refresh', pending: 'Refreshing...' },
  sync: { success: 'Synced successfully', error: 'Failed to sync', pending: 'Syncing...' },
  lock: { success: 'Locked', error: 'Failed to lock', pending: 'Locking...' },
  unlock: { success: 'Unlocked', error: 'Failed to unlock', pending: 'Unlocking...' },
  activate: { success: 'Activated', error: 'Failed to activate', pending: 'Activating...' },
  deactivate: { success: 'Deactivated', error: 'Failed to deactivate', pending: 'Deactivating...' },
  custom: { success: 'Action completed', error: 'Action failed', pending: 'Processing...' }
};
export function useActionHandler() {
  const [loadingActions, setLoadingActions] = useState(new Set());
  const isLoading = useCallback((actionId) => loadingActions.has(actionId), [loadingActions]);
  const executeAction = useCallback(async (
  config,
  context) =>
  {
    const actionId = `${config.type}-${config.label}-${Date.now()}`;
    const messages = defaultMessages[config.type];
    const successMsg = config.successMessage || messages.success;
    const errorMsg = config.errorMessage || messages.error;
    const pendingMsg = config.pendingMessage || messages.pending;
    const contextLabel = context ? ` - ${context}` : '';
    try {
      setLoadingActions((prev) => new Set(prev).add(actionId));
      // Show pending toast for actions that might take time
      let toastId;
      if (config.onExecute) {
        toastId = toast.loading(config.label, { description: pendingMsg });
      }
      // Execute the action
      if (config.onExecute) {
        await config.onExecute();
      }
      // Dismiss loading toast and show success
      if (toastId) {
        toast.dismiss(toastId);
      }
      toast.success(config.label, {
        description: `${successMsg}${contextLabel}`
      });
      return { success: true, message: successMsg };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : errorMsg;
      toast.error(config.label, {
        description: `${errorMessage}${contextLabel}`
      });
      return { success: false, message: errorMessage };
    } finally {
      setLoadingActions((prev) => {
        const next = new Set(prev);
        next.delete(actionId);
        return next;
      });
    }
  }, []);
  // Simplified handlers for common actions
  const handleAction = useCallback((
  action,
  details,
  type = 'custom') =>
  {
    toast.success(action, {
      description: details || defaultMessages[type].success
    });
  }, []);
  const handlePendingAction = useCallback((action, details) => {
    toast.info(action, {
      description: details || 'This feature is coming soon'
    });
  }, []);
  const handleError = useCallback((action, details) => {
    toast.error(action, {
      description: details || 'An error occurred'
    });
  }, []);
  const handleWarning = useCallback((action, details) => {
    toast.warning(action, {
      description: details || 'Please review this action'
    });
  }, []);
  // Quick action handlers
  const quickAction = {
    view: (item) => handleAction('View', `Viewing ${item}`, 'view'),
    edit: (item) => handleAction('Edit', `Editing ${item}`, 'edit'),
    delete: (item) => handleAction('Delete', `${item} deleted successfully`, 'delete'),
    export: (item) => handleAction('Export', `Exporting ${item}...`, 'export'),
    download: (item) => handleAction('Download', `Downloading ${item}...`, 'download'),
    send: (item) => handleAction('Send', `Sent to ${item}`, 'send'),
    approve: (item) => handleAction('Approve', `${item} approved`, 'approve'),
    reject: (item) => handleWarning('Reject', `${item} rejected`),
    reset: (item) => handleAction('Reset', `Reset link sent to ${item}`, 'reset'),
    lock: (item) => handleWarning('Lock', `${item} has been locked`),
    unlock: (item) => handleAction('Unlock', `${item} has been unlocked`, 'unlock'),
    refresh: () => handleAction('Refresh', 'Data refreshed successfully', 'refresh'),
    coming: (feature) => handlePendingAction(feature, 'This feature is coming soon')
  };
  return {
    executeAction,
    isLoading,
    handleAction,
    handlePendingAction,
    handleError,
    handleWarning,
    quickAction,
    loadingActions
  };
}