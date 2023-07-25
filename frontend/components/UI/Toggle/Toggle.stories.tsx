import type { Meta, StoryObj } from '@storybook/react';
import Toggle from '.';

var isChecked = false

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    switchLabel: { control: 'text' }
  }
}

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    switchLabel: 'Label',
    hide: isChecked,
    // setHide: false,
  }
}