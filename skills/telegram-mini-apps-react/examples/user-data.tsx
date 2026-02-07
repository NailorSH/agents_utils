/**
 * User Data Examples
 * 
 * Shows how to access and use Telegram user data.
 */

import {
    initData,
    useLaunchParams,
    useSignal,
    retrieveRawInitData
} from '@tma.js/sdk-react';

/**
 * Get current user information
 */
export function useCurrentUser() {
    try {
        const user = initData.user();

        return {
            id: user?.id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            languageCode: user?.languageCode,
            isPremium: user?.isPremium,
            photoUrl: user?.photoUrl,
        };
    } catch (e) {
        return null;
    }
}

/**
 * Component that displays user info
 */
export function UserProfile() {
    const user = useCurrentUser();

    if (!user) {
        return <div>User data not available</div>;
    }

    return (
        <div className="flex items-center gap-4 p-4">
            {user.photoUrl && (
                <img
                    src={user.photoUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                />
            )}
            <div>
                <div className="font-semibold">
                    {user.firstName} {user.lastName}
                </div>
                {user.username && (
                    <div className="text-sm text-gray-500">@{user.username}</div>
                )}
                {user.isPremium && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        Premium
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Hook to get launch params in component
 */
export function PlatformInfo() {
    const launchParams = useLaunchParams();

    return (
        <div className="p-4 bg-gray-100 rounded-lg text-sm">
            <div>Platform: {launchParams.tgWebAppPlatform}</div>
            <div>Version: {launchParams.tgWebAppVersion}</div>
            <div>Start Param: {launchParams.tgWebAppStartParam || 'none'}</div>
        </div>
    );
}

/**
 * Get chat information (if opened from a chat)
 */
export function useChatInfo() {
    try {
        const chat = initData.chat();
        const receiver = initData.receiver();

        return {
            chat: chat ? {
                id: chat.id,
                type: chat.type,
                title: chat.title,
                photoUrl: chat.photoUrl,
                username: chat.username,
            } : null,
            receiver: receiver ? {
                id: receiver.id,
                firstName: receiver.firstName,
                lastName: receiver.lastName,
                username: receiver.username,
            } : null,
        };
    } catch (e) {
        return { chat: null, receiver: null };
    }
}

/**
 * Service for sending authenticated requests
 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        // Get raw init data for authentication
        const initDataRaw = retrieveRawInitData();

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                // Send init data in Authorization header
                'Authorization': `tma ${initDataRaw}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const apiClient = new ApiClient('https://api.example.com');

/**
 * Example: Analytics service using user data
 */
class AnalyticsService {
    private getUserId(): number | undefined {
        try {
            return initData.user()?.id;
        } catch {
            return undefined;
        }
    }

    async logEvent(event: {
        type: string;
        screen?: string;
        action?: string;
        metadata?: Record<string, string>;
    }) {
        try {
            const userId = this.getUserId();

            await apiClient.post('/analytics/event', {
                ...event,
                userId,
                platform: 'miniapp',
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Analytics error:', error);
            // Fail silently
        }
    }
}

export const analytics = new AnalyticsService();

/**
 * Example: Using query_id for bot integration
 * 
 * When the Mini App was opened from an inline query,
 * you can use query_id to respond to that query.
 */
export function useInlineQuery() {
    try {
        const queryId = initData.queryId();
        const canReply = initData.canSendAfterDate();

        return {
            queryId,
            canReply: canReply ? canReply < new Date() : false,
        };
    } catch {
        return { queryId: null, canReply: false };
    }
}

/**
 * Example usage:
 * 
 * function MyComponent() {
 *   const user = useCurrentUser();
 *   const { chat } = useChatInfo();
 *   
 *   useEffect(() => {
 *     analytics.logEvent({
 *       type: 'page_view',
 *       screen: 'home',
 *     });
 *   }, []);
 *   
 *   const handleSubmit = async (data) => {
 *     // API request with auth
 *     const result = await apiClient.post('/orders', data);
 *   };
 *   
 *   return (
 *     <div>
 *       <UserProfile />
 *       <PlatformInfo />
 *     </div>
 *   );
 * }
 */
