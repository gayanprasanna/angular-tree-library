// Demo app for our awesome Angular Tree Library! 🚀
// This shows off all the cool features we built
import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgxTreeComponent,
  TreeNode,
  TreeConfig,
  TreeNodeClickEvent,
  TreeNodeExpandEvent,
  TreeNodeSelectEvent,
  LazyLoadEvent,
} from 'gp-tree-view';

@Component({
  selector: 'app-root',
  imports: [CommonModule, NgxTreeComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
/**
 * Demo App Component - showcasing our tree library! 🌳
 *
 * This component demonstrates all the features of our Angular Tree Library
 * with real-world examples that developers can relate to.
 *
 * @author Gayan Prasanna
 * @since 1.0.0
 */
export class App {
  protected readonly title = signal('Angular Tree Library Demo');

  // Reference to the tree component so we can call programmatic methods
  @ViewChild(NgxTreeComponent) treeComponent!: NgxTreeComponent;

  // Let's create some realistic tree data that developers can relate to
  // Think of this as a typical developer's file system or project structure
  treeNodes: TreeNode[] = [
    {
      id: '1',
      label: 'My Developer Life',
      icon: '🚀',
      expanded: false,
      hasChildren: true,
      children: [
        {
          id: '1-1',
          label: 'Work Projects',
          icon: '💼',
          hasChildren: true,
          children: [
            {
              id: '1-1-1',
              label: 'angular-tree-library',
              icon: '🌳',
              data: { type: 'project', status: 'active' },
            },
            {
              id: '1-1-2',
              label: 'e-commerce-app',
              icon: '🛒',
              data: { type: 'project', status: 'completed' },
            },
            {
              id: '1-1-3',
              label: 'api-documentation',
              icon: '📚',
              data: { type: 'project', status: 'in-progress' },
            },
            {
              id: '1-1-4',
              label: 'bug-fixes-2024',
              icon: '🐛',
              data: { type: 'project', status: 'active' },
            },
          ],
        },
        {
          id: '1-2',
          label: 'Personal Projects',
          icon: '👨‍💻',
          hasChildren: true,
          children: [
            {
              id: '1-2-1',
              label: 'portfolio-website',
              icon: '🌐',
              data: { type: 'project', status: 'completed' },
            },
            {
              id: '1-2-2',
              label: 'Learning Resources',
              icon: '📚',
              hasChildren: true,
              children: [
                { id: '1-2-2-1', label: 'Angular Tutorials', icon: '📖' },
                { id: '1-2-2-2', label: 'TypeScript Deep Dive', icon: '🔍' },
                { id: '1-2-2-3', label: 'Design Patterns', icon: '🎨' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '2',
      label: 'Development Tools',
      icon: '🛠️',
      hasChildren: true,
      children: [
        { id: '2-1', label: 'Visual Studio Code', icon: '🔧', data: { category: 'editor' } },
        { id: '2-2', label: 'Chrome DevTools', icon: '🌐', data: { category: 'debugging' } },
        { id: '2-3', label: 'Git', icon: '📝', data: { category: 'version-control' } },
        { id: '2-4', label: 'npm', icon: '📦', data: { category: 'package-manager' } },
      ],
    },
    {
      id: '3',
      label: 'Future Ideas 💡',
      icon: '💭',
      hasChildren: true,
      // This folder demonstrates lazy loading - children will be loaded on demand
      // Perfect for when you have a lot of ideas but don't want to load them all at once!
    },
  ];

  // Configuration for our tree - let's make it awesome!
  treeConfig: TreeConfig = {
    showCheckboxes: true, // Let users select multiple items
    showIcons: true, // Icons make everything prettier
    allowMultipleSelection: true, // Select multiple projects at once
    searchable: true, // Find things quickly
    searchPlaceholder: 'Search projects and tools...', // Helpful placeholder
    lazyLoad: true, // Load ideas on demand
    expandOnClick: false, // Let users control expansion
    selectOnClick: false, // Use checkboxes for selection
    animation: true, // Smooth animations are nice

    // Control panel options - now configurable!
    showControls: true, // Show the control panel
    showExpandAll: true, // Show expand all button
    showCollapseAll: true, // Show collapse all button
    showClearSelection: true, // Show clear selection button
  };

  // Keep track of what the user has selected
  selectedNodes: TreeNode[] = [];

  /**
   * Handle when someone clicks on a node
   * @param event - The click event with node details
   */
  onNodeClick(event: TreeNodeClickEvent): void {
    console.log('👆 Someone clicked on:', event.node.label);

    // You could do cool things here like:
    // - Navigate to a project page
    // - Show a preview
    // - Open a context menu
    // - Update the URL

    // For now, let's just log it to the console
    if (event.node.data) {
      console.log('📊 Node data:', event.node.data);
    }
  }

  /**
   * Handle when a node gets expanded or collapsed
   * @param event - The expansion event
   */
  onNodeExpand(event: TreeNodeExpandEvent): void {
    const action = event.expanded ? 'expanded' : 'collapsed';
    console.log(`📂 Node "${event.node.label}" was ${action}`);

    // You could track analytics here or update some state
  }

  /**
   * Handle when a node's selection changes
   * @param event - The selection event
   */
  onNodeSelect(event: TreeNodeSelectEvent): void {
    const action = event.selected ? 'selected' : 'deselected';
    console.log(`☑️ Node "${event.node.label}" was ${action}`);

    // Update our selected nodes list
    this.selectedNodes = event.selectedNodes;

    console.log(`📋 Total selected: ${this.selectedNodes.length} nodes`);
  }

  /**
   * Handle lazy loading - when someone wants to see the "Future Ideas"
   * @param event - The lazy load event with callback
   */
  onLazyLoad(event: LazyLoadEvent): void {
    console.log('🔄 Loading ideas for:', event.node.label);

    // Simulate an API call to load more data
    // In a real app, you'd call your backend service here
    setTimeout(() => {
      console.log('✅ Ideas loaded successfully!');

      // Create some realistic "future ideas" for a developer
      const ideas: TreeNode[] = [
        {
          id: `${event.node.id}-1`,
          label: 'Build a React version',
          icon: '⚛️',
          data: { priority: 'high', category: 'port' },
        },
        {
          id: `${event.node.id}-2`,
          label: 'Add drag & drop support',
          icon: '🖱️',
          data: { priority: 'medium', category: 'feature' },
        },
        {
          id: `${event.node.id}-3`,
          label: 'Create Vue.js wrapper',
          icon: '💚',
          data: { priority: 'low', category: 'wrapper' },
        },
        {
          id: `${event.node.id}-4`,
          label: 'Write comprehensive tests',
          icon: '🧪',
          data: { priority: 'high', category: 'quality' },
        },
        {
          id: `${event.node.id}-5`,
          label: 'Optimize for mobile',
          icon: '📱',
          data: { priority: 'medium', category: 'mobile' },
        },
      ];

      // Call the callback with our loaded data
      event.callback(ideas);
    }, 1500); // Simulate a 1.5 second loading time
  }

  // === Programmatic Control Methods ===
  // These demonstrate how you can control the tree from code

  /**
   * Programmatically expand all nodes
   */
  expandAllProgrammatically(): void {
    console.log('🚀 Programmatically expanding all nodes...');
    this.treeComponent.expandAllProgrammatically();
  }

  /**
   * Programmatically collapse all nodes
   */
  collapseAllProgrammatically(): void {
    console.log('📁 Programmatically collapsing all nodes...');
    this.treeComponent.collapseAllProgrammatically();
  }

  /**
   * Programmatically clear all selections
   */
  clearSelectionProgrammatically(): void {
    console.log('🧹 Programmatically clearing all selections...');
    this.treeComponent.clearSelectionProgrammatically();
  }

  /**
   * Programmatically expand the "Work Projects" folder
   */
  expandWorkProjects(): void {
    console.log('💼 Programmatically expanding Work Projects...');
    const success = this.treeComponent.expandNodeById('1-1');
    console.log(success ? '✅ Successfully expanded!' : '❌ Node not found');
  }

  /**
   * Programmatically select the "angular-tree-library" project
   */
  selectAngularTreeLibrary(): void {
    console.log('🌳 Programmatically selecting angular-tree-library...');
    const success = this.treeComponent.selectNodeById('1-1-1');
    console.log(success ? '✅ Successfully selected!' : '❌ Node not found');
  }

  /**
   * Get and display all selected nodes
   */
  showSelectedNodes(): void {
    const selected = this.treeComponent.getSelectedNodes();
    console.log(
      '📋 Currently selected nodes:',
      selected.map((n: TreeNode) => n.label)
    );
    alert(`Selected nodes: ${selected.map((n: TreeNode) => n.label).join(', ') || 'None'}`);
  }
}
