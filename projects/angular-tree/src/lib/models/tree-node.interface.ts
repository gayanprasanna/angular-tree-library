/**
 * The core TreeNode interface - represents a single node in our tree
 *
 * This is the foundation of our tree structure. Every node in the tree
 * implements this interface, giving us a consistent way to work with
 * tree data throughout the application.
 *
 * @author Gayan Prasanna
 * @since 1.0.0
 */
export interface TreeNode {
  /** Unique identifier for this node - used for tracking and selection */
  id: string | number;

  /** The text that gets displayed to the user */
  label: string;

  /** Child nodes - this is what makes it a tree! */
  children?: TreeNode[];

  /** Whether this node is currently expanded (showing its children) */
  expanded?: boolean;

  /** Whether we're currently loading children (for lazy loading) */
  loading?: boolean;

  /** Whether this node has children (even if not loaded yet) */
  hasChildren?: boolean;

  /** Any custom data you want to attach to this node */
  data?: any;

  /** Icon to display next to the label (emoji, HTML, etc.) */
  icon?: string;

  /** Whether this node is disabled (can't be interacted with) */
  disabled?: boolean;

  /** Whether this node can be selected (defaults to true) */
  selectable?: boolean;

  /** Whether this node is currently selected */
  selected?: boolean;
}

/**
 * Configuration interface for the tree component
 *
 * This interface lets you customize how the tree behaves and looks.
 * All properties are optional, so you only need to specify what you want to change.
 *
 * @author Gayan Prasanna
 * @since 1.0.0
 */
export interface TreeConfig {
  /** Whether to show checkboxes for node selection */
  showCheckboxes?: boolean;

  /** Whether to show icons next to node labels */
  showIcons?: boolean;

  /** Whether users can select multiple nodes at once */
  allowMultipleSelection?: boolean;

  /** Whether to show the search input */
  searchable?: boolean;

  /** Placeholder text for the search input */
  searchPlaceholder?: string;

  /** Whether to enable lazy loading for child nodes */
  lazyLoad?: boolean;

  /** Whether clicking a node should expand/collapse it */
  expandOnClick?: boolean;

  /** Whether clicking a node should select/deselect it */
  selectOnClick?: boolean;

  /** Whether to show animations for expand/collapse */
  animation?: boolean;

  /** Maximum depth of the tree (useful for preventing infinite recursion) */
  maxDepth?: number;

  // === Control Panel Options ===

  /** Whether to show the control panel with expand/collapse/clear buttons */
  showControls?: boolean;

  /** Whether to show the "Expand All" button */
  showExpandAll?: boolean;

  /** Whether to show the "Collapse All" button */
  showCollapseAll?: boolean;

  /** Whether to show the "Clear Selection" button */
  showClearSelection?: boolean;
}

/**
 * Event emitted when the user searches in the tree
 */
export interface TreeSearchEvent {
  /** The search query the user typed */
  query: string;

  /** All nodes that matched the search */
  results: TreeNode[];
}

/**
 * Event emitted when a user clicks on a node
 */
export interface TreeNodeClickEvent {
  /** The node that was clicked */
  node: TreeNode;

  /** The original mouse event */
  event: MouseEvent;
}

/**
 * Event emitted when a node is expanded or collapsed
 */
export interface TreeNodeExpandEvent {
  /** The node that was expanded/collapsed */
  node: TreeNode;

  /** Whether the node is now expanded (true) or collapsed (false) */
  expanded: boolean;
}

/**
 * Event emitted when a node's selection changes
 */
export interface TreeNodeSelectEvent {
  /** The node that was selected/deselected */
  node: TreeNode;

  /** Whether the node is now selected (true) or deselected (false) */
  selected: boolean;

  /** Array of all currently selected nodes */
  selectedNodes: TreeNode[];
}

/**
 * Event emitted when lazy loading is triggered
 *
 * This is used when a node needs to load its children on demand.
 * The callback function should be called with the loaded children.
 */
export interface LazyLoadEvent {
  /** The node that needs its children loaded */
  node: TreeNode;

  /** Callback function to call when children are loaded */
  callback: (children: TreeNode[]) => void;
}
