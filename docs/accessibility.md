# Accessibility Guidelines for AMP

This document outlines accessibility guidelines and best practices for developing AMP components and pages. AMP is committed to making the web accessible to everyone, and we expect all contributions to follow these guidelines.

## Table of Contents

- [Overview](#overview)
- [Core Principles](#core-principles)
- [Testing for Accessibility](#testing-for-accessibility)
- [Common Accessibility Requirements](#common-accessibility-requirements)
- [Component-Specific Guidelines](#component-specific-guidelines)
- [Tools and Resources](#tools-and-resources)
- [Checklist](#checklist)

## Overview

Accessibility ensures that web content is usable by people with disabilities. AMP components should be built with accessibility in mind from the start, following [WCAG 2.1 AA guidelines](https://www.w3.org/WAI/WCAG21/quickref/) and implementing [WAI-ARIA](https://www.w3.org/WAI/ARIA/) specifications where appropriate.

## Core Principles

### 1. Perceivable

- Provide text alternatives for non-text content
- Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Make content adaptable to different presentations without losing meaning
- Make it easier for users to see and hear content

### 2. Operable

- Make all functionality available via keyboard
- Give users enough time to read and use content
- Don't design content that causes seizures or physical reactions
- Help users navigate and find content

### 3. Understandable

- Make text readable and understandable
- Make content appear and operate in predictable ways
- Help users avoid and correct mistakes

### 4. Robust

- Maximize compatibility with assistive technologies
- Use valid, semantic HTML
- Ensure content remains accessible as technologies advance

## Testing for Accessibility

### Automated Testing

1. **Lighthouse Accessibility Audit**: Run `lighthouse --only=accessibility` on AMP pages
2. **axe-core**: Use the [axe browser extension](https://www.deque.com/axe/browser-extensions/) or integrate axe into your testing workflow
3. **WAVE**: Use the [Web Accessibility Evaluation Tool](https://wave.webaim.org/)

### Manual Testing

1. **Keyboard Navigation**: Test all interactive elements using only the keyboard
2. **Screen Reader Testing**: Test with screen readers like NVDA, JAWS, or VoiceOver
3. **Color Contrast**: Verify contrast ratios meet WCAG requirements
4. **Focus Management**: Ensure focus is clearly visible and logically ordered

### Testing Commands

```bash
# Run accessibility tests in AMP
amp unit --files=test/unit/**/test-a11y-*.js
amp integration --files=test/integration/**/test-a11y-*.js

# Run Lighthouse accessibility audit
lighthouse https://example.com --only=accessibility --chrome-flags=\"--headless\"
```

## Common Accessibility Requirements

### Semantic HTML

```html
<!-- Good: Use semantic HTML elements -->
<button>Click me</button>
<nav aria-label=\"Main navigation\">...</nav>
<main>...</main>
<h1>Page Title</h1>

<!-- Bad: Using divs for interactive elements -->
<div onclick=\"handleClick()\">Click me</div>
```

### Alternative Text

```html
<!-- Good: Descriptive alt text -->
<img src=\"chart.png\" alt=\"Sales increased 25% from January to March 2023\">

<!-- Good: Empty alt for decorative images -->
<img src=\"decoration.png\" alt=\"\" role=\"presentation\">

<!-- Bad: Missing or poor alt text -->
<img src=\"chart.png\" alt=\"chart\">
```

### Focus Management

```javascript
// Good: Manage focus appropriately
const dialog = document.querySelector('[role=\"dialog\"]');
const previousFocus = document.activeElement;
dialog.focus();

// When closing dialog
previousFocus.focus();
```

### ARIA Labels and Descriptions

```html
<!-- Good: Proper ARIA labeling -->
<button aria-label=\"Close dialog\">×</button>
<input aria-describedby=\"password-help\" type=\"password\">
<div id=\"password-help\">Password must be at least 8 characters</div>

<!-- Good: Form labels -->
<label for=\"email\">Email Address</label>
<input id=\"email\" type=\"email\" required>
```

## Component-Specific Guidelines

### Interactive Components

- All interactive elements must be keyboard accessible
- Provide clear focus indicators
- Use appropriate ARIA roles and properties
- Implement proper state management (aria-expanded, aria-selected, etc.)

### Media Components

- Provide captions and transcripts for video content
- Include audio descriptions when necessary
- Ensure media controls are keyboard accessible
- Respect user preferences for autoplay and motion

### Form Components

- Associate labels with form controls
- Provide clear error messages
- Use fieldsets and legends for grouped controls
- Implement proper validation feedback

### Navigation Components

- Use landmark roles (navigation, main, complementary)
- Provide skip links for keyboard users
- Implement breadcrumb navigation where appropriate
- Use proper heading hierarchy

## Tools and Resources

### Development Tools

- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension for accessibility testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Automated accessibility auditing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Color Contrast Analyzers](https://www.tpgi.com/color-contrast-checker/) - Check color contrast ratios

### Screen Readers

- [NVDA](https://www.nvaccess.org/) (Windows, free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows, commercial)
- [VoiceOver](https://support.apple.com/guide/voiceover/) (macOS/iOS, built-in)
- [Orca](https://help.gnome.org/users/orca/stable/) (Linux, free)

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)

## Checklist

Use this checklist when developing or reviewing AMP components:

### Basic Requirements

- [ ] Component uses semantic HTML elements
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are clearly visible
- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Component works with screen readers
- [ ] No accessibility errors in automated testing tools

### Content

- [ ] Images have appropriate alternative text
- [ ] Form inputs have associated labels
- [ ] Error messages are clearly associated with relevant fields
- [ ] Content is readable and understandable
- [ ] Headings follow logical hierarchy

### Interaction

- [ ] All functionality is available via keyboard
- [ ] Focus management is implemented correctly
- [ ] ARIA properties accurately reflect component state
- [ ] Component announces state changes to screen readers
- [ ] User can exit or dismiss modal content

### Testing

- [ ] Component passes automated accessibility tests
- [ ] Manual keyboard testing completed
- [ ] Screen reader testing completed
- [ ] Color contrast verified
- [ ] Component tested with users with disabilities (when possible)

## Implementation Examples

### Accessible Button Component

```javascript
/**
 * Accessible button implementation
 */
class AccessibleButton extends BaseElement {
  buildCallback() {
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('tabindex', '0');
    
    this.element.addEventListener('click', this.handleClick.bind(this));
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
  }
  
  handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick(event);
    }
  }
  
  handleClick(event) {
    // Announce action to screen readers
    this.announceToScreenReader('Button activated');
  }
  
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }
}
```

### Accessible Modal Dialog

```javascript
/**
 * Accessible modal dialog implementation
 */
class AccessibleModal extends BaseElement {
  buildCallback() {
    this.dialog = this.element.querySelector('[role=\"dialog\"]');
    this.overlay = this.element.querySelector('.overlay');
    this.closeButton = this.element.querySelector('.close-button');
    
    this.previousFocus = null;
    this.setupEventListeners();
  }
  
  open() {
    this.previousFocus = document.activeElement;
    this.element.hidden = false;
    this.dialog.focus();
    this.trapFocus();
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    // Announce to screen readers
    this.announceToScreenReader('Dialog opened');
  }
  
  close() {
    this.element.hidden = true;
    document.body.style.overflow = '';
    
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
    
    this.announceToScreenReader('Dialog closed');
  }
  
  trapFocus() {
    const focusableElements = this.dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    this.dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      } else if (event.key === 'Escape') {
        this.close();
      }
    });
  }
}
```

## Conclusion

Building accessible AMP components is essential for creating an inclusive web. By following these guidelines and integrating accessibility testing into your development workflow, you help ensure that AMP content is usable by everyone, regardless of their abilities or the technologies they use to access the web.

For questions about accessibility in AMP, reach out to the [#accessibility channel](https://amphtml.slack.com/messages/accessibility/) on Slack or refer to the resources listed above.