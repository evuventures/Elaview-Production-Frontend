import type { Meta, StoryObj } from '@storybook/react';
import { BasicNavbar } from './BasicNavbar';

const meta: Meta<typeof BasicNavbar> = {
  title: 'Components/BasicNavbar',
  component: BasicNavbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A minimal navbar component with basic styling that can be built up from scratch. Uses slate-200 background and slate-800 text colors.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    brandName: {
      control: 'text',
      description: 'Brand/logo text to display',
    },
    user: {
      control: 'object',
      description: 'Current user data (null for logged out state)',
    },
    navItems: {
      control: 'object',
      description: 'Array of navigation items',
    },
    onNavigate: { action: 'navigate' },
    onSignIn: { action: 'sign-in' },
    onSignOut: { action: 'sign-out' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic states
export const Default: Story = {
  args: {},
};

export const LoggedOut: Story = {
  args: {
    user: null,
  },
};

export const LoggedIn: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john.doe@company.com',
    },
  },
};

// Different brand names
export const CustomBrand: Story = {
  args: {
    brandName: 'My Company',
    user: {
      name: 'Jane Smith',
      email: 'jane@mycompany.com',
    },
  },
};

// Custom navigation items
export const CustomNavigation: Story = {
  args: {
    navItems: [
      { label: 'Home', href: '/', active: false },
      { label: 'Products', href: '/products', active: true },
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    user: {
      name: 'Demo User',
      email: 'demo@example.com',
    },
  },
};

// Minimal navigation
export const MinimalNavigation: Story = {
  args: {
    navItems: [
      { label: 'Home', href: '/', active: true },
      { label: 'Dashboard', href: '/dashboard' },
    ],
    user: {
      name: 'Min User',
      email: 'min@example.com',
    },
  },
};

// Many navigation items
export const ManyNavItems: Story = {
  args: {
    navItems: [
      { label: 'Dashboard', href: '/dashboard', active: true },
      { label: 'Campaigns', href: '/campaigns' },
      { label: 'Analytics', href: '/analytics' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Messages', href: '/messages' },
      { label: 'Billing', href: '/billing' },
      { label: 'Settings', href: '/settings' },
      { label: 'Help', href: '/help' },
    ],
    user: {
      name: 'Power User',
      email: 'power@example.com',
    },
  },
};

// Long user name
export const LongUserName: Story = {
  args: {
    user: {
      name: 'Christopher Alexander Thompson',
      email: 'christopher.alexander.thompson@verylongcompanyname.com',
    },
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    user: {
      name: 'Mobile User',
      email: 'mobile@example.com',
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Elaview specific example
export const ElaviewExample: Story = {
  args: {
    brandName: 'Elaview',
    navItems: [
      { label: 'Home', href: '/home', active: true },
      { label: 'Browse Spaces', href: '/browse' },
      { label: 'My Campaigns', href: '/campaigns' },
      { label: 'Analytics', href: '/analytics' },
      { label: 'Account', href: '/account' },
    ],
    user: {
      name: 'Marketing Manager',
      email: 'manager@advertiser.com',
    },
  },
};

// Empty navigation
export const EmptyNavigation: Story = {
  args: {
    navItems: [],
    user: {
      name: 'Simple User',
      email: 'simple@example.com',
    },
  },
};

// Interactive showcase
export const InteractiveShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Logged Out State</h2>
        <BasicNavbar user={null} />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Logged In State</h2>
        <BasicNavbar
          user={{
            name: 'Demo User',
            email: 'demo@elaview.com',
          }}
        />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Custom Navigation</h2>
        <BasicNavbar
          navItems={[
            { label: 'Overview', href: '/overview', active: true },
            { label: 'Projects', href: '/projects' },
            { label: 'Team', href: '/team' },
            { label: 'Reports', href: '/reports' },
          ]}
          user={{
            name: 'Custom User',
            email: 'custom@company.com',
          }}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};