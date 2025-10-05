// Main tree component - the heart of our tree library
// Built with love and lots of coffee ☕
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Our trusty interfaces and services
import {
  TreeNode,
  TreeConfig,
  TreeSearchEvent,
  TreeNodeClickEvent,
  TreeNodeExpandEvent,
  TreeNodeSelectEvent,
  LazyLoadEvent,
} from './models/tree-node.interface';
import { TreeService } from './services/tree.service';
import { NgxTreeNodeComponent } from './components/tree-node.component';

@Component({
  selector: 'ngx-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxTreeNodeComponent],
  providers: [TreeService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-tree-container" [class.ngx-tree-with-search]="config.searchable">
      <!-- Search Input -->
      <div *ngIf="config?.searchable" class="ngx-tree-search">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearch($event)"
          [placeholder]="config.searchPlaceholder || 'Search...'"
          class="ngx-tree-search-input"
        />
        <button
          *ngIf="searchQuery"
          (click)="clearSearch()"
          class="ngx-tree-search-clear"
          type="button"
        >
          ×
        </button>
      </div>

      <!-- Tree Controls -->
      <div class="ngx-tree-controls" *ngIf="shouldShowControls">
        <button
          *ngIf="shouldShowExpandAll"
          (click)="expandAll()"
          class="ngx-tree-control-btn"
          type="button"
        >
          Expand All
        </button>
        <button
          *ngIf="shouldShowCollapseAll"
          (click)="collapseAll()"
          class="ngx-tree-control-btn"
          type="button"
        >
          Collapse All
        </button>
        <button
          *ngIf="shouldShowClearSelection"
          (click)="clearSelection()"
          class="ngx-tree-control-btn"
          type="button"
        >
          Clear Selection
        </button>
      </div>

      <!-- Tree Nodes -->
      <div class="ngx-tree-nodes">
        <ngx-tree-node
          *ngFor="let node of displayNodes; trackBy: trackByNodeId"
          [node]="node"
          [config]="config"
          [level]="0"
          (nodeClick)="onNodeClick($event)"
          (nodeExpand)="onNodeExpand($event)"
          (nodeSelect)="onNodeSelect($event)"
          (lazyLoad)="onLazyLoad($event)"
        ></ngx-tree-node>
      </div>

      <!-- Empty State -->
      <div *ngIf="displayNodes.length === 0" class="ngx-tree-empty">
        <ng-content select="[slot=empty]">
          <p>No data available</p>
        </ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .ngx-tree-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: 1px solid #e1e5e9;
        border-radius: 6px;
        background: #fff;
        overflow: hidden;
      }

      .ngx-tree-with-search {
        padding-top: 0;
      }

      .ngx-tree-search {
        position: relative;
        padding: 12px;
        border-bottom: 1px solid #e1e5e9;
        background: #f8f9fa;
      }

      .ngx-tree-search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      .ngx-tree-search-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .ngx-tree-search-clear {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 18px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
      }

      .ngx-tree-search-clear:hover {
        color: #374151;
      }

      .ngx-tree-controls {
        padding: 8px 12px;
        border-bottom: 1px solid #e1e5e9;
        background: #f8f9fa;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .ngx-tree-control-btn {
        padding: 4px 8px;
        font-size: 12px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: #fff;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
      }

      .ngx-tree-control-btn:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }

      .ngx-tree-nodes {
        max-height: 400px;
        overflow-y: auto;
      }

      .ngx-tree-empty {
        padding: 24px;
        text-align: center;
        color: #6b7280;
        font-style: italic;
      }
    `,
  ],
})
/**
 * The main tree component - where all the magic happens! ✨
 *
 * This component handles the overall tree structure, search functionality,
 * and coordinates between different parts of the tree system.
 *
 * @author Gayan Prasanna
 * @since 1.0.0
 */
export class NgxTreeComponent implements OnInit, OnChanges {
  // Input properties - what the parent component gives us
  @Input() nodes: TreeNode[] = []; // The actual tree data
  @Input() config: TreeConfig = {}; // How we should behave
  @Input() showControls: boolean = true; // Show expand/collapse buttons? (legacy - use config.showControls instead)
  @Input() searchable: boolean = true; // Can users search? (legacy prop)

  // Output events - what we tell the parent when things happen
  @Output() nodeClick = new EventEmitter<TreeNodeClickEvent>(); // Someone clicked a node
  @Output() nodeExpand = new EventEmitter<TreeNodeExpandEvent>(); // Node got expanded/collapsed
  @Output() nodeSelect = new EventEmitter<TreeNodeSelectEvent>(); // Node selection changed
  @Output() search = new EventEmitter<TreeSearchEvent>(); // User is searching
  @Output() lazyLoad = new EventEmitter<LazyLoadEvent>(); // Time to load more data!

  // Internal state - what we keep track of
  searchQuery: string = ''; // What the user is searching for
  displayNodes: TreeNode[] = []; // Nodes currently visible (after filtering)
  searchResults: TreeNode[] = []; // Results from the last search

  constructor(private treeService: TreeService, private cdr: ChangeDetectorRef) {
    // TreeService is our best friend - it handles all the complex tree logic
    // ChangeDetectorRef helps us trigger updates when needed
  }

  // === Control Visibility Getters ===
  // These determine whether each control should be shown based on configuration

  /**
   * Whether to show the control panel
   * Uses config.showControls if set, otherwise falls back to the legacy showControls input
   */
  get shouldShowControls(): boolean {
    return this.config.showControls !== undefined ? this.config.showControls : this.showControls;
  }

  /**
   * Whether to show the "Expand All" button
   */
  get shouldShowExpandAll(): boolean {
    return this.config.showExpandAll !== false; // Default to true if not specified
  }

  /**
   * Whether to show the "Collapse All" button
   */
  get shouldShowCollapseAll(): boolean {
    return this.config.showCollapseAll !== false; // Default to true if not specified
  }

  /**
   * Whether to show the "Clear Selection" button
   * Only shows if checkboxes are enabled
   */
  get shouldShowClearSelection(): boolean {
    return this.config.showClearSelection !== false && this.config.showCheckboxes === true;
  }

  ngOnInit(): void {
    // When the component starts up, let's get everything ready
    this.initializeTree();
    this.setupSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If someone changes our data or config, we need to refresh
    if (changes['nodes'] || changes['config']) {
      this.initializeTree();
    }
  }

  /**
   * Set up our tree with the initial data and sensible defaults
   * This is like unpacking a box and putting things in their right places
   */
  private initializeTree(): void {
    this.displayNodes = [...this.nodes]; // Make a copy so we don't mess with original data
    this.applyDefaultConfig();
  }

  /**
   * Apply sensible defaults to our configuration
   * Think of this as setting up the perfect workspace
   */
  private applyDefaultConfig(): void {
    this.config = {
      showCheckboxes: false, // Start simple - no checkboxes by default
      showIcons: true, // Icons make everything prettier
      allowMultipleSelection: false, // Single selection is usually what people want
      searchable: true, // Search is super useful
      searchPlaceholder: 'Search...', // Helpful placeholder text
      lazyLoad: false, // Most trees don't need lazy loading
      expandOnClick: false, // Let users decide when to expand
      selectOnClick: false, // Same for selection
      animation: true, // Animations make things feel smooth

      // Control panel options
      showControls: true, // Show control panel by default
      showExpandAll: true, // Show expand all button
      showCollapseAll: true, // Show collapse all button
      showClearSelection: true, // Show clear selection button

      ...this.config, // But let users override anything they want
    };
  }

  /**
   * Set up our reactive subscriptions
   * This is how we listen to changes from our service
   */
  private setupSubscriptions(): void {
    // Listen for search results from our service
    this.treeService.searchResults$.subscribe((results) => {
      this.searchResults = results;
      this.updateDisplayNodes();
    });
  }

  /**
   * Update what nodes we're showing based on search results
   * This is like filtering your inbox - show only what's relevant
   */
  private updateDisplayNodes(): void {
    if (this.searchQuery && this.searchResults.length > 0) {
      // Show filtered results when searching
      this.displayNodes = this.treeService.filterNodes(this.nodes, this.searchResults);
    } else {
      // Show everything when not searching
      this.displayNodes = [...this.nodes];
    }
  }

  /**
   * Handle when the user types in the search box
   * @param query - What they're looking for
   */
  onSearch(query: string): void {
    this.searchQuery = query;
    this.treeService.setSearchQuery(query);

    if (query.trim()) {
      // Actually search for something
      const results = this.treeService.searchNodes(this.nodes, query);
      this.searchResults = results;
      this.search.emit({ query, results });
    } else {
      // Clear search
      this.searchResults = [];
      this.search.emit({ query: '', results: [] });
    }

    this.updateDisplayNodes();
  }

  /**
   * Clear the search and show all nodes again
   * Like hitting the "show all" button
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch('');
  }

  /**
   * Someone clicked on a node - let's see what they want to do
   * @param event - The click event with node info
   */
  onNodeClick(event: TreeNodeClickEvent): void {
    // Tell the parent component about the click
    this.nodeClick.emit(event);

    // Maybe they want to expand it automatically?
    if (this.config.expandOnClick && event.node.hasChildren) {
      this.toggleNodeExpansion(event.node);
    }

    // Or maybe they want to select it?
    if (this.config.selectOnClick) {
      this.toggleNodeSelection(event.node);
    }
  }

  /**
   * A node got expanded or collapsed
   * @param event - Expansion event details
   */
  onNodeExpand(event: TreeNodeExpandEvent): void {
    this.nodeExpand.emit(event);
  }

  /**
   * A node's selection changed
   * @param event - Selection event details
   */
  onNodeSelect(event: TreeNodeSelectEvent): void {
    this.nodeSelect.emit(event);
  }

  /**
   * Time to load more data for a node (lazy loading)
   * @param event - Lazy load event with callback
   */
  onLazyLoad(event: LazyLoadEvent): void {
    this.lazyLoad.emit(event);
  }

  /**
   * Toggle whether a node is expanded or collapsed
   * @param node - The node to toggle
   */
  toggleNodeExpansion(node: TreeNode): void {
    if (node.hasChildren && !node.loading) {
      node.expanded = !node.expanded;
      this.onNodeExpand({ node, expanded: node.expanded });
      this.cdr.markForCheck(); // Tell Angular to check for changes
    }
  }

  /**
   * Toggle whether a node is selected
   * @param node - The node to toggle
   */
  toggleNodeSelection(node: TreeNode): void {
    if (node.selectable !== false) {
      const event = this.treeService.toggleNodeSelection(node, this.config.allowMultipleSelection);
      this.onNodeSelect(event);
      this.cdr.markForCheck(); // Tell Angular to check for changes
    }
  }

  /**
   * Expand all visible nodes - useful for seeing everything at once
   */
  expandAll(): void {
    this.treeService.expandAll(this.displayNodes);
    this.cdr.markForCheck(); // Tell Angular to check for changes
  }

  /**
   * Collapse all visible nodes - clean up the view
   */
  collapseAll(): void {
    this.treeService.collapseAll(this.displayNodes);
    this.cdr.markForCheck(); // Tell Angular to check for changes
  }

  /**
   * Clear all selections - start fresh
   */
  clearSelection(): void {
    this.treeService.clearSelection();
    this.cdr.markForCheck(); // Tell Angular to check for changes
  }

  /**
   * Track function for ngFor - helps Angular know which nodes changed
   * This makes rendering much faster!
   * @param index - Array index (we don't use this)
   * @param node - The node object
   * @returns The unique identifier for this node
   */
  trackByNodeId(index: number, node: TreeNode): string | number {
    return node.id;
  }

  // === Programmatic Control Methods ===
  // These methods allow external components to control the tree programmatically

  /**
   * Programmatically expand all nodes in the tree
   * This is the same as clicking the "Expand All" button
   */
  public expandAllProgrammatically(): void {
    this.expandAll();
  }

  /**
   * Programmatically collapse all nodes in the tree
   * This is the same as clicking the "Collapse All" button
   */
  public collapseAllProgrammatically(): void {
    this.collapseAll();
  }

  /**
   * Programmatically clear all selections
   * This is the same as clicking the "Clear Selection" button
   */
  public clearSelectionProgrammatically(): void {
    this.clearSelection();
  }

  /**
   * Programmatically expand a specific node by its ID
   * @param nodeId - The ID of the node to expand
   * @returns True if the node was found and expanded, false otherwise
   */
  public expandNodeById(nodeId: string | number): boolean {
    const node = this.findNodeById(this.displayNodes, nodeId);
    if (node && node.hasChildren) {
      node.expanded = true;
      this.onNodeExpand({ node, expanded: true });
      this.cdr.markForCheck();
      return true;
    }
    return false;
  }

  /**
   * Programmatically collapse a specific node by its ID
   * @param nodeId - The ID of the node to collapse
   * @returns True if the node was found and collapsed, false otherwise
   */
  public collapseNodeById(nodeId: string | number): boolean {
    const node = this.findNodeById(this.displayNodes, nodeId);
    if (node && node.hasChildren) {
      node.expanded = false;
      this.onNodeExpand({ node, expanded: false });
      this.cdr.markForCheck();
      return true;
    }
    return false;
  }

  /**
   * Programmatically select a node by its ID
   * @param nodeId - The ID of the node to select
   * @returns True if the node was found and selected, false otherwise
   */
  public selectNodeById(nodeId: string | number): boolean {
    const node = this.findNodeById(this.displayNodes, nodeId);
    if (node && node.selectable !== false) {
      if (!node.selected) {
        const event = this.treeService.toggleNodeSelection(
          node,
          this.config.allowMultipleSelection
        );
        this.onNodeSelect(event);
        this.cdr.markForCheck();
      }
      return true;
    }
    return false;
  }

  /**
   * Programmatically deselect a node by its ID
   * @param nodeId - The ID of the node to deselect
   * @returns True if the node was found and deselected, false otherwise
   */
  public deselectNodeById(nodeId: string | number): boolean {
    const node = this.findNodeById(this.displayNodes, nodeId);
    if (node && node.selectable !== false) {
      if (node.selected) {
        const event = this.treeService.toggleNodeSelection(
          node,
          this.config.allowMultipleSelection
        );
        this.onNodeSelect(event);
        this.cdr.markForCheck();
      }
      return true;
    }
    return false;
  }

  /**
   * Get all currently selected nodes
   * @returns Array of selected nodes
   */
  public getSelectedNodes(): TreeNode[] {
    return this.treeService.getSelectedNodes();
  }

  /**
   * Get a node by its ID
   * @param nodes - The tree nodes to search through
   * @param nodeId - The ID to search for
   * @returns The found node or null
   */
  private findNodeById(nodes: TreeNode[], nodeId: string | number): TreeNode | null {
    for (const node of nodes) {
      if (node.id === nodeId) {
        return node;
      }
      if (node.children) {
        const found = this.findNodeById(node.children, nodeId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}
