# PasswordInput Component

A reusable React component that provides a password input field with show/hide functionality using an eye icon.

## Features

- **Show/Hide Password**: Click the eye icon to toggle between showing and hiding the password
- **Accessible**: Includes proper ARIA labels for screen readers
- **Responsive**: Adapts to different screen sizes
- **Customizable**: Accepts all standard input props
- **Consistent Styling**: Matches the existing design system

## Usage

```jsx
import PasswordInput from '../Common/PasswordInput';

// Basic usage
<PasswordInput
  id="password"
  name="password"
  value={password}
  onChange={handleChange}
  placeholder="Enter your password"
  required
/>

// With custom label
<PasswordInput
  id="confirmPassword"
  name="confirmPassword"
  value={confirmPassword}
  onChange={handleChange}
  placeholder="Confirm your password"
  required
  label="Confirm Password"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | - | Input field ID |
| `name` | string | - | Input field name |
| `value` | string | - | Input field value |
| `onChange` | function | - | Change handler function |
| `placeholder` | string | - | Placeholder text |
| `required` | boolean | false | Whether the field is required |
| `className` | string | '' | Additional CSS classes |
| `label` | string | - | Label text (optional) |
| `...props` | - | - | All other standard input props |

## Styling

The component uses CSS custom properties for consistent theming:

- `--transition-fast`: Transition duration for hover effects
- `--color-accent-green`: Focus state color
- `--color-text-muted`: Default icon color
- `--color-text-dark`: Hover state color

## Accessibility

- Eye icon button has proper `aria-label` that changes based on state
- Keyboard navigation support
- Focus indicators for better usability
- Screen reader friendly

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Responsive design for mobile devices
- Graceful degradation for older browsers
