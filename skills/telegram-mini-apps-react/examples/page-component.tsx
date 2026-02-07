/**
 * Page Component Example
 * 
 * A reusable wrapper component that handles:
 * - Back button visibility and click handling
 * - Deep link detection for proper navigation
 * - Analytics page view tracking
 * - Safe area CSS variable usage
 */

import { type PropsWithChildren, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { backButton, miniApp } from '@tma.js/sdk-react';

interface PageProps {
    /**
     * Whether to show the back button. Default: true
     * Set to false for the home/main screen
     */
    back?: boolean;

    /**
     * Screen name for analytics tracking
     */
    screenName?: string;
}

/**
 * Page wrapper component that manages back button behavior
 */
export function Page({
    children,
    back = true,
    screenName
}: PropsWithChildren<PageProps>) {
    const navigate = useNavigate();
    const location = useLocation();

    // Track page views
    useEffect(() => {
        if (screenName) {
            // Your analytics implementation
            console.log('Page view:', screenName);
        }
    }, [screenName]);

    // Handle back button
    useEffect(() => {
        if (back) {
            backButton.show();

            // onClick returns an unsubscribe function
            return backButton.onClick(() => {
                // Check if we arrived via deep link
                const isDeeplink = (location.state as any)?.fromDeeplink;

                // Check if this is the first page in history
                const isFirstPage = !window.history.state || window.history.state.idx === 0;

                if (isDeeplink || isFirstPage) {
                    // Close the Mini App entirely
                    miniApp.close();
                } else {
                    // Navigate back in history
                    navigate(-1);
                }
            });
        }

        // Hide back button if not needed
        backButton.hide();
    }, [back, navigate, location]);

    return <>{children}</>;
}

/**
 * Page header with proper safe area handling
 */
export function PageHeader({
    title,
    subtitle
}: {
    title: ReactNode;
    subtitle?: ReactNode
}) {
    return (
        <div className="w-full relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/10" />

            {/* Content with safe area padding */}
            <div
                className="relative mx-auto max-w-md px-4 pb-6 text-center"
                style={{
                    // Use CSS variables for safe area
                    paddingTop: 'max(2rem, calc(var(--tg-viewport-content-safe-area-inset-top, 0px) + var(--tg-viewport-safe-area-inset-top, 0px)))'
                }}
            >
                <h1 className="text-2xl font-semibold">{title}</h1>
                {subtitle && (
                    <div className="mt-2 text-sm text-gray-500">{subtitle}</div>
                )}
            </div>
        </div>
    );
}

/**
 * Page content container
 */
export function PageContainer({
    children,
    fullWidth = false
}: {
    children: ReactNode;
    fullWidth?: boolean;
}) {
    return (
        <section
            className={
                fullWidth
                    ? "relative w-full h-full flex flex-col flex-1 min-h-0"
                    : "relative container mx-auto max-w-md px-4 py-4 pb-28 flex flex-col flex-1 min-h-0"
            }
        >
            {children}
        </section>
    );
}

/**
 * Fixed footer with safe area handling
 */
export function PageFooter({ children }: { children: ReactNode }) {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/80 backdrop-blur-sm px-4 pt-4 z-50"
            style={{
                // Account for bottom safe area (home indicator on iOS)
                paddingBottom: 'calc(1rem + var(--tg-viewport-safe-area-inset-bottom, 0px))'
            }}
        >
            {children}
        </div>
    );
}

/**
 * Example usage:
 * 
 * function BookingPage() {
 *   return (
 *     <Page back={true} screenName="booking">
 *       <PageHeader title="Book a Court" subtitle="Select your time" />
 *       <PageContainer>
 *         <BookingForm />
 *       </PageContainer>
 *       <PageFooter>
 *         <Button onClick={handleBook}>Confirm Booking</Button>
 *       </PageFooter>
 *     </Page>
 *   );
 * }
 * 
 * function HomePage() {
 *   return (
 *     <Page back={false} screenName="home">
 *       <PageContainer>
 *         <HomeContent />
 *       </PageContainer>
 *     </Page>
 *   );
 * }
 */
