import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmationModal = ({ onCancel, onConfirm }: ConfirmationModalProps) => (
  <div className="fixed inset-0 bg-black-1/80 flex items-center justify-center z-50 p-4">
    <div className="bg-black-1 border border-gray-800 rounded-xl p-6 max-w-md w-full">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle size={24} className="text-red-500" />
        <h2 className="text-xl font-bold text-white-1">Clear all notifications?</h2>
      </div>
      <p className="text-white-2 mb-6">
        This will permanently delete all your notifications. This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-white-1 hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmationModal;