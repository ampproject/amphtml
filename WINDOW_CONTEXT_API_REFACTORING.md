# Window.Context API Refactoring - Eliminating Problematic Terminology

## Overview

This document outlines the comprehensive refactoring of the `window.context` API to eliminate problematic terminology while maintaining full backward compatibility and functional integrity.

## Problem Statement

The original `window.context` API used master/slave terminology which is considered problematic and inappropriate in modern software development. This refactoring addresses GitHub issue #30789 by replacing these terms with inclusive, neutral alternatives.

## Changes Made

### 1. Core API Changes

#### Function Renames
- `masterSelection()` → `primaryFrameSelection()`
- `computeInMasterFrame()` → `computeInPrimaryFrame()`

#### Property Renames
- `window.context.master` → `window.context.primary`
- `window.context.isMaster` → `window.context.isPrimary`

#### Internal Variable Renames
- `__ampMasterTasks` → `__ampPrimaryTasks`
- `masterName` → `primaryFrameName`
- `master` → `primaryFrame`

### 2. Backward Compatibility

To ensure minimal disruption to existing code, legacy properties and methods are maintained:

```javascript
// Legacy getters for backward compatibility
get master() {
  return this.primary;
}

get isMaster() {
  return this.isPrimary;
}

// Legacy function for backward compatibility
export function computeInMasterFrame(global, taskId, work, cb) {
  computeInPrimaryFrame(global, taskId, work, cb);
}
```

### 3. Updated Files

#### Core Implementation Files
- `3p/ampcontext-integration.js` - Main API implementation
- `3p/3p.js` - Core 3p functionality
- `3p/ampcontext.js` - Base context class
- `build-system/externs/amp.extern.js` - API externs

#### Vendor Integration Files
- `ads/vendors/clickio.js`
- `ads/vendors/adocean.js`
- `ads/vendors/kargo.js`
- `ads/vendors/medianet.js`
- `ads/vendors/imedia.js`
- `ads/vendors/springAds.js`
- `ads/vendors/ssp.js`
- `ads/vendors/yieldpro.js`
- `ads/vendors/swoop.js`
- `ads/vendors/appnexus.js`
- `ads/vendors/yieldbot.js`

#### Test Files
- `test/unit/test-3p.js`
- `test/unit/ads/test-ssp.js`
- `test/unit/ads/test-pubmine.js`
- `test/integration/test-amp-ad-3p.js`
- `test/unit/3p/test-ampcontext-integration.js`
- `extensions/amp-ad/0.1/test/test-amp-ad-xorigin-iframe-handler.js`

#### Documentation and Comments
- `src/3p-frame.js`
- `extensions/amp-ad/0.1/amp-ad-xorigin-iframe-handler.js`

### 4. Terminology Mapping

| Old Term | New Term | Context |
|----------|----------|---------|
| master | primary | Frame coordination |
| slave | secondary | Frame coordination |
| master frame | primary frame | Iframe management |
| slave frame | secondary frame | Iframe management |
| masterSelection | primaryFrameSelection | Frame selection logic |
| computeInMasterFrame | computeInPrimaryFrame | Task coordination |

### 5. API Usage Examples

#### Before (Legacy)
```javascript
// Check if current frame is master
if (window.context.isMaster) {
  // Perform coordination work
}

// Get master frame reference
const masterFrame = window.context.master;

// Coordinate work across frames
computeInMasterFrame(global, 'task-id', work, callback);
```

#### After (New API)
```javascript
// Check if current frame is primary
if (window.context.isPrimary) {
  // Perform coordination work
}

// Get primary frame reference
const primaryFrame = window.context.primary;

// Coordinate work across frames
computeInPrimaryFrame(global, 'task-id', work, callback);
```

#### Backward Compatible (Both work)
```javascript
// Both old and new APIs work
if (window.context.isMaster || window.context.isPrimary) {
  // This will work with either property
}
```

### 6. Migration Strategy

#### Phase 1: Implementation (Complete)
- ✅ Implement new API with legacy compatibility
- ✅ Update all internal usage
- ✅ Update all test files
- ✅ Update all vendor integrations

#### Phase 2: Documentation (Complete)
- ✅ Update API documentation
- ✅ Update code comments
- ✅ Create migration guide

#### Phase 3: Deprecation (Future)
- Add deprecation warnings for legacy API
- Set timeline for removal
- Provide migration tools

### 7. Testing Strategy

#### Unit Tests
- All existing tests updated to use new terminology
- Legacy compatibility tests added
- New API functionality tests added

#### Integration Tests
- Vendor integration tests updated
- Cross-frame communication tests updated
- Performance impact tests conducted

#### Backward Compatibility Tests
- Legacy API calls still function
- No breaking changes to existing integrations
- Performance characteristics maintained

### 8. Risk Assessment

#### Low Risk Areas
- Internal API usage (fully controlled)
- Test files (can be updated immediately)
- New integrations (can use new API)

#### Medium Risk Areas
- Third-party vendor integrations
- External documentation references
- Community code examples

#### Mitigation Strategies
- Backward compatibility maintained
- Comprehensive testing performed
- Clear migration documentation provided
- Gradual deprecation timeline

### 9. Performance Impact

- **Minimal**: Only property access changes, no algorithmic changes
- **Memory**: Negligible increase due to legacy property maintenance
- **CPU**: No measurable impact on execution time

### 10. Future Considerations

#### Deprecation Timeline
- Legacy API will be maintained for at least 2 major versions
- Deprecation warnings will be added in future releases
- Removal will be announced with 6-month notice

#### Migration Tools
- ESLint rules to encourage new API usage
- Automated migration scripts for bulk updates
- Documentation updates for community

## Conclusion

This refactoring successfully eliminates problematic terminology from the `window.context` API while maintaining full backward compatibility. The changes are comprehensive, well-tested, and provide a clear migration path for all stakeholders.

The new API is more inclusive and aligns with modern software development practices, while the legacy API ensures that existing integrations continue to work without modification. 