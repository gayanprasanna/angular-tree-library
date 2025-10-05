# 🌳 gp-tree-view

[![npm version](https://badge.fury.io/js/gp-tree-view.svg)](https://badge.fury.io/js/gp-tree-view)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red.svg)](https://angular.io/)

A powerful, feature-rich Angular tree component with expand/collapse, search, lazy loading, and selection capabilities. Built with love and lots of coffee ☕

## ✨ Features

- 🌳 **Hierarchical Tree Structure** - Display nested data in a clean, organized tree format
- 🔍 **Smart Search** - Real-time search with highlighting and filtering
- 📦 **Lazy Loading** - Load children on-demand for better performance
- ☑️ **Flexible Selection** - Single or multiple selection with checkboxes
- 🎨 **Customizable Styling** - Modern, responsive design with easy customization
- ⚡ **Performance Optimized** - Built with Angular's OnPush change detection
- 🎯 **TypeScript Support** - Full type safety with comprehensive interfaces
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎮 **Programmatic Control** - Control tree behavior via code
- 🛠️ **Highly Configurable** - Show/hide controls and customize behavior

## 🚀 Quick Start

### Installation

```bash
npm install gp-tree-view
```

### Basic Usage

```typescript
import { NgxTreeComponent, TreeNode, TreeConfig } from 'gp-tree-view';

@Component({
  selector: 'app-example',
  imports: [NgxTreeComponent],
  template: `
    <ngx-tree
      [nodes]="treeData"
      [config]="treeConfig"
      (nodeClick)="onNodeClick($event)"
      (nodeExpand)="onNodeExpand($event)"
      (nodeSelect)="onNodeSelect($event)"
      (lazyLoad)="onLazyLoad($event)"
    ></ngx-tree>
  `
})
export class ExampleComponent {
  treeData: TreeNode[] = [
    {
      id: '1',
      label: 'My Projects',
      icon: '🚀',
      hasChildren: true,
      children: [
        { id: '1-1', label: 'Awesome Project', icon: '⭐' },
        { id: '1-2', label: 'Another Project', icon: '💎' }
      ]
    }
  ];

  treeConfig: TreeConfig = {
    showCheckboxes: true,
    showIcons: true,
    allowMultipleSelection: true,
    searchable: true,
    lazyLoad: true
  };

  onNodeClick(event: TreeNodeClickEvent) {
    console.log('Clicked:', event.node.label);
  }

  onLazyLoad(event: LazyLoadEvent) {
    // Load more data from your API
    this.apiService.getChildren(event.node.id).subscribe(children => {
      event.callback(children);
    });
  }
}
```

## 📚 API Reference

### TreeNode Interface

```typescript
interface TreeNode {
  id: string | number;           // Unique identifier
  label: string;                 // Display text
  children?: TreeNode[];         // Child nodes
  expanded?: boolean;            // Initial expansion state
  loading?: boolean;             // Loading state for lazy loading
  hasChildren?: boolean;         // Whether node has children
  data?: any;                    // Custom data
  icon?: string;                 // Icon (emoji, HTML, etc.)
  disabled?: boolean;            // Disable interaction
  selectable?: boolean;          // Allow selection
  selected?: boolean;            // Selection state
}
```

### TreeConfig Interface

```typescript
interface TreeConfig {
  // Basic options
  showCheckboxes?: boolean;      // Show selection checkboxes
  showIcons?: boolean;           // Show node icons
  allowMultipleSelection?: boolean; // Allow multiple selections
  searchable?: boolean;          // Enable search functionality
  searchPlaceholder?: string;    // Search input placeholder
  lazyLoad?: boolean;            // Enable lazy loading
  expandOnClick?: boolean;       // Expand nodes on click
  selectOnClick?: boolean;       // Select nodes on click
  animation?: boolean;           // Enable animations
  maxDepth?: number;             // Maximum tree depth
  
  // Control panel options
  showControls?: boolean;        // Show control panel
  showExpandAll?: boolean;       // Show expand all button
  showCollapseAll?: boolean;     // Show collapse all button
  showClearSelection?: boolean;  // Show clear selection button
}
```

### Events

#### nodeClick
```typescript
interface TreeNodeClickEvent {
  node: TreeNode;
  event: MouseEvent;
}
```

#### nodeExpand
```typescript
interface TreeNodeExpandEvent {
  node: TreeNode;
  expanded: boolean;
}
```

#### nodeSelect
```typescript
interface TreeNodeSelectEvent {
  node: TreeNode;
  selected: boolean;
  selectedNodes: TreeNode[];
}
```

#### lazyLoad
```typescript
interface LazyLoadEvent {
  node: TreeNode;
  callback: (children: TreeNode[]) => void;
}
```

## 🎮 Programmatic Control

Control the tree programmatically using these methods:

```typescript
// Get reference to tree component
@ViewChild(NgxTreeComponent) treeComponent!: NgxTreeComponent;

// Global controls
expandAll() {
  this.treeComponent.expandAllProgrammatically();
}

collapseAll() {
  this.treeComponent.collapseAllProgrammatically();
}

clearSelection() {
  this.treeComponent.clearSelectionProgrammatically();
}

// Specific node controls
expandNode() {
  this.treeComponent.expandNodeById('1-1');
}

selectNode() {
  this.treeComponent.selectNodeById('1-1-1');
}

// Get selected nodes
getSelected() {
  const selected = this.treeComponent.getSelectedNodes();
  console.log('Selected:', selected);
}
```

## 🎨 Customization

### CSS Custom Properties

```css
.ngx-tree-container {
  --tree-border-color: #e1e5e9;
  --tree-background: #fff;
  --tree-hover-background: #f3f4f6;
  --tree-selected-background: #dbeafe;
  --tree-selected-color: #1e40af;
}
```

### Advanced Configuration

```typescript
treeConfig: TreeConfig = {
  showCheckboxes: true,
  showIcons: true,
  allowMultipleSelection: true,
  searchable: true,
  searchPlaceholder: 'Search files...',
  lazyLoad: true,
  expandOnClick: false,
  selectOnClick: false,
  animation: true,
  
  // Control panel customization
  showControls: true,
  showExpandAll: true,
  showCollapseAll: false,  // Hide collapse all button
  showClearSelection: true
};
```

## 🌟 Advanced Examples

### Lazy Loading

```typescript
onLazyLoad(event: LazyLoadEvent): void {
  // Simulate API call
  setTimeout(() => {
    const children: TreeNode[] = [
      { id: `${event.node.id}-1`, label: 'Child 1', icon: '📄' },
      { id: `${event.node.id}-2`, label: 'Child 2', icon: '📄' }
    ];
    event.callback(children);
  }, 1000);
}
```

### Dynamic Tree Updates

```typescript
// Add new node
addNode() {
  const newNode: TreeNode = {
    id: Date.now(),
    label: 'New Node',
    icon: '✨'
  };
  this.treeData = [...this.treeData, newNode];
}

// Remove node
removeNode(nodeId: string) {
  this.treeData = this.treeData.filter(node => node.id !== nodeId);
}
```

## 🌐 Live Demo

Check out the interactive demo: [https://gayanprasanna.github.io/angular-tree-library/](https://gayanprasanna.github.io/angular-tree-library/)

## 📋 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Angular](https://angular.io/)
- Styled with modern CSS
- Icons by [Emoji](https://emojipedia.org/)

## 📞 Support

If you have any questions or need help:

1. Check the [documentation](#-api-reference)
2. Search [existing issues](https://github.com/gayanprasanna/angular-tree-library/issues)
3. Create a [new issue](https://github.com/gayanprasanna/angular-tree-library/issues/new)

---

Made with ❤️ by [Gayan Prasanna](https://github.com/gayanprasanna)