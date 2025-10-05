// Tree node component - each individual node in our tree
// This is where the real UI magic happens! ✨
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TreeNode,
  TreeConfig,
  TreeNodeClickEvent,
  TreeNodeExpandEvent,
  TreeNodeSelectEvent,
  LazyLoadEvent,
} from '../models/tree-node.interface';

@Component({
  selector: 'ngx-tree-node',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ngx-tree-node" [style.padding-left.px]="indent">
      <div
        class="ngx-tree-node-content"
        [class.ngx-tree-node-selected]="node.selected"
        [class.ngx-tree-node-disabled]="node.disabled"
        (click)="onNodeClick($event)"
      >
        <!-- Expand/Collapse Button -->
        <button
          *ngIf="node.hasChildren"
          (click)="onExpandClick($event)"
          class="ngx-tree-expand-btn"
          [class.ngx-tree-expanded]="node.expanded"
          [disabled]="node.loading"
          type="button"
        >
          <span *ngIf="!node.loading" class="ngx-tree-expand-icon">▶</span>
          <span *ngIf="node.loading" class="ngx-tree-loading-spinner">⟳</span>
        </button>

        <!-- Checkbox -->
        <input
          *ngIf="config.showCheckboxes && node.selectable !== false"
          type="checkbox"
          [checked]="node.selected"
          (change)="onCheckboxChange($event)"
          class="ngx-tree-checkbox"
        />

        <!-- Node Icon -->
        <span
          *ngIf="config.showIcons && node.icon"
          class="ngx-tree-node-icon"
          [innerHTML]="node.icon"
        ></span>

        <!-- Node Label -->
        <span class="ngx-tree-node-label">{{ node.label }}</span>

        <!-- Custom Content Slot -->
        <ng-content></ng-content>
      </div>

      <!-- Children -->
      <div
        *ngIf="node.expanded && node.children"
        class="ngx-tree-children"
        [class.ngx-tree-children-animated]="config.animation"
      >
        <ngx-tree-node
          *ngFor="let child of node.children; trackBy: trackByNodeId"
          [node]="child"
          [config]="config"
          [level]="level + 1"
          (nodeClick)="onChildNodeClick($event)"
          (nodeExpand)="onChildNodeExpand($event)"
          (nodeSelect)="onChildNodeSelect($event)"
          (lazyLoad)="onChildLazyLoad($event)"
        ></ngx-tree-node>
      </div>

      <!-- Lazy Loading Placeholder -->
      <div
        *ngIf="node.expanded && node.hasChildren && !node.children && config.lazyLoad"
        class="ngx-tree-lazy-placeholder"
        (click)="onLazyLoadClick($event)"
      >
        <span class="ngx-tree-lazy-text">Click to load children...</span>
      </div>
    </div>
  `,
  styles: [
    `
      .ngx-tree-node {
        position: relative;
      }

      .ngx-tree-node-content {
        display: flex;
        align-items: center;
        padding: 6px 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
        user-select: none;
      }

      .ngx-tree-node-content:hover {
        background-color: #f3f4f6;
      }

      .ngx-tree-node-selected {
        background-color: #dbeafe;
        color: #1e40af;
      }

      .ngx-tree-node-disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ngx-tree-expand-btn {
        background: none;
        border: none;
        padding: 2px 4px;
        margin-right: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        transition: all 0.2s;
      }

      .ngx-tree-expand-btn:hover {
        background-color: #e5e7eb;
      }

      .ngx-tree-expand-btn:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .ngx-tree-expand-icon {
        font-size: 10px;
        transition: transform 0.2s;
      }

      .ngx-tree-expanded .ngx-tree-expand-icon {
        transform: rotate(90deg);
      }

      .ngx-tree-loading-spinner {
        font-size: 12px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .ngx-tree-checkbox {
        margin-right: 6px;
        cursor: pointer;
      }

      .ngx-tree-node-icon {
        margin-right: 6px;
        font-size: 14px;
        display: flex;
        align-items: center;
      }

      .ngx-tree-node-label {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
      }

      .ngx-tree-children {
        border-left: 1px solid #e5e7eb;
        margin-left: 8px;
      }

      .ngx-tree-children-animated {
        animation: slideDown 0.2s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          max-height: 0;
        }
        to {
          opacity: 1;
          max-height: 1000px;
        }
      }

      .ngx-tree-lazy-placeholder {
        padding: 8px 16px;
        margin-left: 24px;
        color: #6b7280;
        font-style: italic;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .ngx-tree-lazy-placeholder:hover {
        background-color: #f3f4f6;
      }

      .ngx-tree-lazy-text {
        font-size: 12px;
      }
    `,
  ],
})
/**
 * Individual tree node component - the building block of our tree! 🌿
 *
 * This component represents a single node in the tree and handles all the
 * user interactions like clicking, expanding, selecting, etc.
 *
 * @author Gayan Prasanna
 * @since 1.0.0
 */
export class NgxTreeNodeComponent {
  // Inputs - what the parent tells us about this node
  @Input() node!: TreeNode; // The actual node data
  @Input() config: TreeConfig = {}; // How we should behave
  @Input() level: number = 0; // How deep we are in the tree (for indentation)

  constructor(private cdr: ChangeDetectorRef) {}

  // Outputs - what we tell the parent when things happen
  @Output() nodeClick = new EventEmitter<TreeNodeClickEvent>(); // Someone clicked us
  @Output() nodeExpand = new EventEmitter<TreeNodeExpandEvent>(); // We got expanded/collapsed
  @Output() nodeSelect = new EventEmitter<TreeNodeSelectEvent>(); // Our selection changed
  @Output() lazyLoad = new EventEmitter<LazyLoadEvent>(); // Time to load our children

  /**
   * Calculate how much we should indent based on our level
   * This creates the nice tree-like visual hierarchy
   */
  get indent(): number {
    return this.level * 20; // 20px per level
  }

  /**
   * Handle when someone clicks on our node
   * @param event - The mouse click event
   */
  onNodeClick(event: MouseEvent): void {
    // Don't do anything if we're disabled
    if (this.node.disabled) {
      return;
    }

    // Tell the parent that we got clicked
    this.nodeClick.emit({
      node: this.node,
      event,
    });
  }

  /**
   * Handle when someone clicks the expand/collapse button
   * @param event - The mouse click event
   */
  onExpandClick(event: MouseEvent): void {
    event.stopPropagation(); // Don't trigger the node click

    // Don't expand if we're loading or disabled
    if (this.node.loading || this.node.disabled) {
      return;
    }

    if (this.node.hasChildren) {
      // Toggle our expanded state
      this.node.expanded = !this.node.expanded;
      this.nodeExpand.emit({
        node: this.node,
        expanded: this.node.expanded,
      });

      // If we're expanding and need lazy loading, trigger it
      if (this.node.expanded && this.config.lazyLoad && !this.node.children) {
        this.triggerLazyLoad();
      }

      // Tell Angular to check for changes
      this.cdr.markForCheck();
    }
  }

  /**
   * Handle when someone changes our checkbox
   * @param event - The checkbox change event
   */
  onCheckboxChange(event: Event): void {
    event.stopPropagation(); // Don't trigger the node click

    // Don't change selection if we're disabled
    if (this.node.disabled) {
      return;
    }

    // Update our selection state
    this.node.selected = (event.target as HTMLInputElement).checked;
    this.nodeSelect.emit({
      node: this.node,
      selected: this.node.selected,
      selectedNodes: [], // The parent tree component will handle the full selection logic
    });

    // Tell Angular to check for changes
    this.cdr.markForCheck();
  }

  /**
   * Handle when someone clicks on the lazy load placeholder
   * @param event - The mouse click event
   */
  onLazyLoadClick(event: MouseEvent): void {
    event.stopPropagation(); // Don't trigger the node click
    this.triggerLazyLoad();
  }

  /**
   * Trigger lazy loading for this node
   * This shows a loading state and asks the parent to load our children
   */
  private triggerLazyLoad(): void {
    this.node.loading = true; // Show loading spinner

    // Ask the parent to load our children
    this.lazyLoad.emit({
      node: this.node,
      callback: (children: TreeNode[]) => {
        // When the parent calls this callback, we're done loading
        this.node.loading = false;
        this.node.children = children;
        this.node.hasChildren = children.length > 0;

        // Tell Angular to check for changes
        this.cdr.markForCheck();
      },
    });
  }

  // These methods just pass events up from our children to our parent
  // It's like being a messenger between the child nodes and the main tree component

  /**
   * Pass a click event from a child node up to our parent
   */
  onChildNodeClick(event: TreeNodeClickEvent): void {
    this.nodeClick.emit(event);
  }

  /**
   * Pass an expand event from a child node up to our parent
   */
  onChildNodeExpand(event: TreeNodeExpandEvent): void {
    this.nodeExpand.emit(event);
  }

  /**
   * Pass a selection event from a child node up to our parent
   */
  onChildNodeSelect(event: TreeNodeSelectEvent): void {
    this.nodeSelect.emit(event);
  }

  /**
   * Pass a lazy load event from a child node up to our parent
   */
  onChildLazyLoad(event: LazyLoadEvent): void {
    this.lazyLoad.emit(event);
  }

  /**
   * Track function for ngFor - helps Angular know which nodes changed
   * This makes rendering much faster when we have lots of nodes!
   * @param index - Array index (we don't use this)
   * @param node - The node object
   * @returns The unique identifier for this node
   */
  trackByNodeId(index: number, node: TreeNode): string | number {
    return node.id;
  }
}
