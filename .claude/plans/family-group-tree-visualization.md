# Family Group Tree Visualization Implementation Plan

## Overview
Create a visual family group tree page that displays the nuclear family tree for a family group, with support for merged families showing each nuclear family in its own container connected by node-lines.

## Requirements Summary

1. **Button on Show Page**: Add a "View Family Tree" button on `/family-tree/{uuid}` that navigates to the tree visualization
2. **Family Group Tree Page**: New page showing the family tree similar to `/your-tree`
3. **Merged Family Display**: When families are merged, each nuclear family appears in a container/box with connecting lines between containers

## Implementation Steps

### Phase 1: Backend - Service & Controller

#### 1.1 Create FamilyGroupTreeService
- Build tree data for a family group based on root user
- Handle merged families by grouping members by their source tree
- Return structured data with containers for merged families

#### 1.2 Add Controller Method
- Add `viewTree()` method to `FamilyTreeController`
- Route: `GET /family-tree/{familyTree}/tree`
- Fetch tree data from service and pass to Inertia

### Phase 2: Frontend - React Components

#### 2.1 Create FamilyGroupTree Page Component
- New page at `resources/js/Pages/GuestPages/AuthAccessPages/FamilyTree/FamilyGroupTree.tsx`
- Receives tree data from controller
- Renders the visualization component

#### 2.2 Create FamilyGroupTreeVisualization Component
- New component at `resources/js/Components/FamilyTree/FamilyGroupTreeVisualization.tsx`
- Similar to `ConnectionTreeVisualization.tsx` but with container support
- Features:
  - Single nuclear family: Standard tree view
  - Merged families: Each family in a bordered container with title
  - Container-to-container connections

#### 2.3 Add Button to MyFamilyTree Page
- Add "View Family Tree" button in the page header
- Links to `/family-tree/{uuid}/tree`

### Phase 3: Data Structures

#### Tree Data Structure (Single Family)
```typescript
interface FamilyGroupTreeData {
    familyTreeId: number;
    familyTreeUuid: string;
    familyName: string;
    isMerged: boolean;
    containers: FamilyContainer[];
    containerConnections: ContainerConnection[];
}

interface FamilyContainer {
    id: number;
    name: string;  // e.g., "The Johnsons"
    nodes: TreeNode[];
    edges: TreeEdge[];
    rootUserId: number;
}

interface ContainerConnection {
    sourceContainerId: number;
    targetContainerId: number;
    connectionType: string;  // e.g., "merged"
}

interface TreeNode {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
    relationshipType: string;
    nodeColor: string;
    x?: number;  // Position calculated by layout
    y?: number;
}

interface TreeEdge {
    id: string;
    source: number;
    target: number;
    label: string;
    color: string;
}
```

### Phase 4: Visual Design

#### Single Family Tree
- Same layout as `/your-tree`
- Husband/wife at top (level 0)
- Children below (level 1)
- Standard node connections

#### Merged Family Trees
- Each family in a distinct container:
  - Rounded rectangle border
  - Family name header (e.g., "The Johnsons")
  - Light background color
  - Internal tree layout unchanged
- Container-to-container connections:
  - Thick line connecting container borders
  - Label showing "Merged" or relationship type
  - Different color (purple/gold) for merge lines

## File Changes Summary

### New Files
1. `resources/js/Pages/GuestPages/AuthAccessPages/FamilyTree/FamilyGroupTree.tsx`
2. `resources/js/Components/FamilyTree/FamilyGroupTreeVisualization.tsx`

### Modified Files
1. `app/Http/Controllers/GuestControllers/AuthAccessControllers/FamilyTreeController.php` - Add viewTree method
2. `app/Actions/GuestServices/AuthAccessServices/FamilyTreeService.php` - Add buildFamilyGroupTree method
3. `resources/js/Pages/GuestPages/AuthAccessPages/FamilyTree/MyFamilyTree.tsx` - Add button
4. `routes/web.php` - Add route for tree visualization

## Implementation Order
1. Backend service method
2. Controller method & route
3. Button on show page
4. Page component
5. Visualization component (single family first)
6. Merged family container support
