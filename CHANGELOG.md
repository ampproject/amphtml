# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New features and enhancements

### Changed

- Changes to existing functionality

### Deprecated

- Features that will be removed in future versions

### Removed

- Features that have been removed

### Fixed

- Bug fixes

### Security

- Security improvements and vulnerability fixes

## Guidelines for Contributors

When adding entries to this changelog:

1. **Add new entries to the [Unreleased] section** at the top of the file
2. **Use the following categories** in this order:
   - Added - for new features
   - Changed - for changes in existing functionality
   - Deprecated - for soon-to-be removed features
   - Removed - for now removed features
   - Fixed - for any bug fixes
   - Security - in case of vulnerabilities

3. **Follow this format** for entries:

   ```markdown
   - Brief description of change [#issue-number](https://github.com/ampproject/amphtml/issues/issue-number)
   ```

4. **Link to issues and PRs** when possible using the format above

5. **Write for users, not developers** - focus on how changes affect users of AMP

6. **Group related changes** under the same category when it makes sense

7. **Use present tense** and imperative mood for consistency

## Example Entry Format

```markdown
## [1.0.0] - 2023-10-03

### Added
- New amp-component for enhanced user interactions [#12345](https://github.com/ampproject/amphtml/issues/12345)
- Support for new HTML5 video formats in amp-video [#12346](https://github.com/ampproject/amphtml/pull/12346)

### Changed
- Improved performance of amp-carousel by 15% [#12347](https://github.com/ampproject/amphtml/issues/12347)
- Updated validation rules for better error messages [#12348](https://github.com/ampproject/amphtml/pull/12348)

### Fixed
- Fixed memory leak in amp-iframe component [#12349](https://github.com/ampproject/amphtml/issues/12349)
- Resolved accessibility issue with keyboard navigation [#12350](https://github.com/ampproject/amphtml/pull/12350)

### Security
- Updated dependencies to address security vulnerabilities [#12351](https://github.com/ampproject/amphtml/security/advisories/GHSA-xxxx-xxxx-xxxx)
```

## Release Process

The changelog is automatically updated during the release process:

1. Before releasing, move entries from [Unreleased] to a new version section
2. Add the release date in YYYY-MM-DD format
3. Update the [Unreleased] section header to prepare for the next release
4. Ensure all significant changes are documented
5. Review entries for clarity and completeness

For more information about the release process, see [Release Schedule](docs/release-schedule.md).