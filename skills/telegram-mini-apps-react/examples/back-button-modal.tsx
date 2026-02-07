/**
 * Modal with Back Button Example
 * 
 * Shows how to handle back button in modals/overlays.
 * The back button should close the modal instead of navigating.
 */

import { useEffect } from "react";
import { backButton } from '@tma.js/sdk-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
    // Take over back button when modal is open
    useEffect(() => {
        if (isOpen) {
            // Show back button
            backButton.show();

            // Handle click to close modal
            const offClick = backButton.onClick(() => {
                onClose();
            });

            // Cleanup: unsubscribe and hide
            return () => {
                offClick();
                backButton.hide();
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal content */}
            <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                {children}
            </div>
        </div>
    );
}

/**
 * Full-screen modal variant
 * Useful for filters, forms, etc.
 */
export function FullscreenModal({ isOpen, onClose, children }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            backButton.show();

            const offClick = backButton.onClick(() => {
                onClose();
            });

            return () => {
                offClick();
                backButton.hide();
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background">
            {/* Header with safe area */}
            <div
                className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl px-6 border-b border-gray-200"
                style={{
                    paddingTop: 'max(1rem, calc(var(--tg-viewport-content-safe-area-inset-top, 0px) + var(--tg-viewport-safe-area-inset-top, 0px)))',
                    paddingBottom: '1rem',
                }}
            >
                <span className="text-xl font-bold">Modal Title</span>
            </div>

            {/* Scrollable content */}
            <div
                className="h-full overflow-y-auto"
                style={{
                    paddingTop: 'calc(4rem + var(--tg-viewport-safe-area-inset-top, 0px))',
                    paddingBottom: 'calc(5rem + var(--tg-viewport-safe-area-inset-bottom, 0px))',
                }}
            >
                {children}
            </div>

            {/* Footer with safe area */}
            <div
                className="absolute bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl px-6 pt-4 border-t border-gray-200 flex gap-3"
                style={{
                    paddingBottom: 'calc(1rem + var(--tg-viewport-safe-area-inset-bottom, 0px))',
                }}
            >
                <button
                    className="flex-1 py-3 rounded-xl border border-gray-300"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button
                    className="flex-1 py-3 rounded-xl bg-primary text-white"
                    onClick={() => {
                        // Handle action
                        onClose();
                    }}
                >
                    Apply
                </button>
            </div>
        </div>
    );
}

/**
 * Example usage:
 * 
 * function FiltersPage() {
 *   const [isModalOpen, setIsModalOpen] = useState(false);
 * 
 *   return (
 *     <>
 *       <button onClick={() => setIsModalOpen(true)}>
 *         Open Filters
 *       </button>
 *       
 *       <FullscreenModal 
 *         isOpen={isModalOpen} 
 *         onClose={() => setIsModalOpen(false)}
 *       >
 *         <FilterForm />
 *       </FullscreenModal>
 *     </>
 *   );
 * }
 */
