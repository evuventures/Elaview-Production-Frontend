import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-essentials", // This is built-in with Storybook 9
    "@storybook/addon-interactions", // For interaction testing
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    // Auto-generate docs for components with 'autodocs' tag
  },
  staticDirs: ['../public'], // Serve your public assets in Storybook
  typescript: {
    check: false, // Disable type checking for faster builds
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;