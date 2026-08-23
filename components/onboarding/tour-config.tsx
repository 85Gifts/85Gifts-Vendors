export interface TourStep {
  id: string
  route?: string
  target: string
  title: string
  body: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'side-dashboard',
    target: '[data-tour-id="side-dashboard"]',
    title: 'Your Home Base',
    body: 'Everything starts here — your sales overview, wallet and quick actions.',
  },
  {
    id: 'dash-wallet',
    target: '[data-tour-id="dash-wallet"]',
    title: 'Fund Your Wallet',
    body: 'Tap here anytime to top up your balance.',
  },
  {
    id: 'dash-withdraw',
    target: '[data-tour-id="dash-withdraw"]',
    title: 'Withdraw Earnings',
    body: 'Cash out your balance whenever you are ready.',
  },
  {
    id: 'dash-chart',
    target: '[data-tour-id="dash-chart"]',
    title: 'Track Performance',
    body: 'Watch how your earnings grow over time.',
  },
  {
    id: 'side-events',
    route: '/dashboard/events',
    target: '[data-tour-id="side-events"]',
    title: 'Manage Events',
    body: 'This is where you create gift events your customers can book.',
  },
  {
    id: 'events-schedule',
    route: '/dashboard/events',
    target: '[data-tour-id="events-schedule"]',
    title: 'Schedule an Event',
    body: 'Tap here to set up your next event in minutes.',
  },
  {
    id: 'side-products',
    route: '/dashboard/products',
    target: '[data-tour-id="side-products"]',
    title: 'Your Products',
    body: 'Add the gifts customers can browse and order.',
  },
  {
    id: 'products-add',
    route: '/dashboard/products',
    target: '[data-tour-id="products-add"]',
    title: 'Add New Product',
    body: 'List a product with photos, price and stock in a few taps.',
  },
  {
    id: 'side-inventory',
    route: '/inventory',
    target: '[data-tour-id="side-inventory"]',
    title: 'Stay Stocked',
    body: 'Keep an eye on stock levels across all your products.',
  },
  {
    id: 'inventory-list',
    route: '/inventory',
    target: '[data-tour-id="inventory-list"]',
    title: 'Adjust Stock',
    body: 'Switch between your dashboard and item list to add or remove stock.',
  },
  {
    id: 'side-ads',
    route: '/dashboard/ads',
    target: '[data-tour-id="side-ads"]',
    title: 'Promote Your Events',
    body: 'Run campaigns to boost visibility and get more bookings.',
  },
  {
    id: 'ads-create',
    route: '/dashboard/ads',
    target: '[data-tour-id="ads-create"]',
    title: 'Create Campaign',
    body: 'Launch an ad for your events in just a few taps.',
  },
  {
    id: 'side-transactions',
    route: '/dashboard/transactions',
    target: '[data-tour-id="side-transactions"]',
    title: 'All Payments',
    body: 'Every booking and payout, tracked in one place.',
  },
  {
    id: 'transactions-table',
    route: '/dashboard/transactions',
    target: '[data-tour-id="transactions-table"]',
    title: 'Transaction History',
    body: 'Filter and search through all your past activity here.',
  },
]
