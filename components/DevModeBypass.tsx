'use client';

import { useEffect } from 'react';

export function DevModeBypass() {
  useEffect(() => {
    // Only intercept fetch in development mode with bypass enabled
    const isDevMode = 
      (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') ||
      (typeof window !== 'undefined' && window.location.hostname === 'localhost');

    if (!isDevMode) return;

    // Store original fetch
    const originalFetch = window.fetch;

    // Mock data for different endpoints
    const getMockResponse = (endpoint: string) => {
      const mockVendor = {
        id: 'dev-vendor-id',
        name: 'Dev User',
        email: 'dev@example.com',
        role: 'vendor',
        isEmailVerified: true,
        businessName: 'Dev Business',
        address: '123 Dev Street',
        phone: '555-DEV-TEST'
      };

      const mockEvent = {
        _id: 'dev-event-id',
        id: 'dev-event-id',
        title: 'Dev Event',
        description: 'Mock event for development',
        date: new Date().toISOString(),
        location: 'Dev Location',
        vendorId: 'dev-vendor-id'
      };

      switch (endpoint) {
        case '/api/profile':
          return mockVendor;
        
        case '/api/vendor/wallet':
          return {
            balance: 1000.00,
            currency: 'USD',
            lastUpdated: new Date().toISOString()
          };
        
        case '/api/vendor/wallet/transactions':
          return {
            transactions: [
              {
                id: '1',
                type: 'credit',
                amount: 500.00,
                description: 'Mock transaction 1',
                date: new Date().toISOString()
              },
              {
                id: '2', 
                type: 'debit',
                amount: -50.00,
                description: 'Mock transaction 2',
                date: new Date(Date.now() - 86400000).toISOString()
              }
            ],
            total: 2,
            page: 1,
            limit: 10
          };
        
        case '/api/events':
          return [mockEvent];
        
        case '/api/events/dev-event-id':
          return mockEvent;
        
        default:
          return { success: true, message: 'Dev mode mock response' };
      }
    };

    // Override fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

      // Only intercept API calls
      if (!url.startsWith('/api/')) {
        return originalFetch(input, init);
      }

      console.log(`[DEV MODE] Intercepted fetch to: ${url}`);

      // Return mock response
      const mockData = getMockResponse(url);
      
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockData),
        text: () => Promise.resolve(JSON.stringify(mockData)),
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: url,
        clone: function() { return this; }
      } as Response);
    };

    console.log('[DEV MODE] Fetch interceptor enabled');

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}