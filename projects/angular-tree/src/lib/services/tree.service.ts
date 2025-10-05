// Tree service - the brain behind all the tree operations
// This is where we handle all the complex tree logic so components stay clean
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TreeNode, TreeSearchEvent, TreeNodeSelectEvent } from '../models/tree-node.interface';

/**
 * The TreeService - our tree logic powerhouse! 🧠
 *
 * This service handles all the complex operations like searching, filtering,
 * selection management, and tree traversal. Think of it as the engine
 * that makes our tree component work smoothly.
 *
 * @author Gayan Prasanna
 * @since 1.0.0
 */
@Injectable()
export class TreeService {
  // Our reactive state - these streams keep everything in sync
  private selectedNodesSubject = new BehaviorSubject<TreeNode[]>([]);
  private searchResultsSubject = new BehaviorSubject<TreeNode[]>([]);
  private searchQuerySubject = new BehaviorSubject<string>('');

  // Public observables - how components listen to our state changes
  public selectedNodes$ = this.selectedNodesSubject.asObservable();
  public searchResults$ = this.searchResultsSubject.asObservable();
  public searchQuery$ = this.searchQuerySubject.asObservable();

  constructor() {
    // Ready to rock! 🎸
  }

  /**
   * Search through the tree to find matching nodes
   * This is like a smart search that finds nodes AND their parents
   *
   * @param nodes - The tree nodes to search through
   * @param query - What the user is looking for
   * @returns Array of matching nodes (including parents of matches)
   */
  searchNodes(nodes: TreeNode[], query: string): TreeNode[] {
    // If there's no search term, just return everything
    if (!query || query.trim() === '') {
      return nodes;
    }

    const results: TreeNode[] = [];
    const searchTerm = query.toLowerCase(); // Case-insensitive search

    /**
     * Recursively search through a node and its children
     * This inner function does the heavy lifting
     */
    const searchInNode = (node: TreeNode): boolean => {
      // Check if this node matches
      const matches = node.label.toLowerCase().includes(searchTerm);

      if (matches) {
        results.push(node);
        return true; // We found a match!
      }

      // If this node has children, check them too
      if (node.children) {
        const hasMatchingChildren = node.children.some((child) => searchInNode(child));
        if (hasMatchingChildren) {
          // Even if this node doesn't match, if a child does, include this node
          results.push(node);
          return true;
        }
      }

      return false; // No match found here
    };

    // Search through all top-level nodes
    nodes.forEach((node) => searchInNode(node));
    return results;
  }

  /**
   * Filter the tree to show only nodes that match our search results
   * This creates a "pruned" version of the tree with only relevant nodes
   *
   * @param nodes - The full tree
   * @param searchResults - Nodes that matched the search
   * @returns Filtered tree showing only matching nodes and their parents
   */
  filterNodes(nodes: TreeNode[], searchResults: TreeNode[]): TreeNode[] {
    // If no search results, show everything
    if (searchResults.length === 0) {
      return nodes;
    }

    // Create a set of IDs for fast lookup
    const resultIds = new Set(searchResults.map((node) => node.id));

    /**
     * Recursively filter a node and its children
     * This is where the magic happens - we build a new tree with only relevant nodes
     */
    const filterNode = (node: TreeNode): TreeNode | null => {
      // If this node is in our search results, include it
      if (resultIds.has(node.id)) {
        return {
          ...node,
          children: node.children
            ? (node.children.map(filterNode).filter(Boolean) as TreeNode[])
            : undefined,
          expanded: true, // Auto-expand so users can see the matches
        };
      }

      // If this node has children, check if any of them are relevant
      if (node.children) {
        const filteredChildren = node.children.map(filterNode).filter(Boolean) as TreeNode[];

        // If any children are relevant, include this parent node too
        if (filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
            expanded: true, // Auto-expand to show the relevant children
          };
        }
      }

      // This node and its children aren't relevant to the search
      return null;
    };

    // Filter all top-level nodes and return only the relevant ones
    return nodes.map(filterNode).filter(Boolean) as TreeNode[];
  }

  /**
   * Toggle whether a node is selected or not
   * This handles both single and multiple selection modes
   *
   * @param node - The node to toggle
   * @param allowMultiple - Whether we can select multiple nodes
   * @returns Event with selection details
   */
  toggleNodeSelection(node: TreeNode, allowMultiple: boolean = false): TreeNodeSelectEvent {
    const currentSelected = this.selectedNodesSubject.value;
    let newSelected: TreeNode[];

    if (node.selected) {
      // User wants to deselect this node
      newSelected = currentSelected.filter((selectedNode) => selectedNode.id !== node.id);
      node.selected = false;
    } else {
      // User wants to select this node
      if (allowMultiple) {
        // Multiple selection mode - just add this node
        newSelected = [...currentSelected, node];
      } else {
        // Single selection mode - deselect everything else first
        currentSelected.forEach((selectedNode) => (selectedNode.selected = false));
        newSelected = [node];
      }
      node.selected = true;
    }

    // Update our state and notify everyone listening
    this.selectedNodesSubject.next(newSelected);

    return {
      node,
      selected: node.selected,
      selectedNodes: newSelected,
    };
  }

  /**
   * Get all currently selected nodes
   * @returns Array of selected nodes
   */
  getSelectedNodes(): TreeNode[] {
    return this.selectedNodesSubject.value;
  }

  /**
   * Clear all selections - start fresh
   * This unchecks everything and clears our selection state
   */
  clearSelection(): void {
    const currentSelected = this.selectedNodesSubject.value;
    currentSelected.forEach((node) => (node.selected = false));
    this.selectedNodesSubject.next([]);
  }

  /**
   * Update the current search query
   * @param query - The search term
   */
  setSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
  }

  /**
   * Expand all nodes in the tree - show everything!
   * This recursively goes through all nodes and expands them
   *
   * @param nodes - The nodes to expand
   */
  expandAll(nodes: TreeNode[]): void {
    nodes.forEach((node) => {
      node.expanded = true;
      // If this node has children, expand them too
      if (node.children) {
        this.expandAll(node.children);
      }
    });
  }

  /**
   * Collapse all nodes in the tree - hide everything!
   * This recursively goes through all nodes and collapses them
   *
   * @param nodes - The nodes to collapse
   */
  collapseAll(nodes: TreeNode[]): void {
    nodes.forEach((node) => {
      node.expanded = false;
      // If this node has children, collapse them too
      if (node.children) {
        this.collapseAll(node.children);
      }
    });
  }

  /**
   * Flatten the tree into a simple array
   * Sometimes you need all nodes in a flat list instead of nested structure
   *
   * @param nodes - The tree nodes to flatten
   * @returns Flat array of all nodes
   */
  flattenNodes(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];

    /**
     * Recursively add nodes to our flat array
     */
    const flatten = (nodeList: TreeNode[]) => {
      nodeList.forEach((node) => {
        result.push(node);
        // Add children too if they exist
        if (node.children) {
          flatten(node.children);
        }
      });
    };

    flatten(nodes);
    return result;
  }
}
