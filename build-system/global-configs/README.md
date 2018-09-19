# Flags

This directory contains a consolidated configuration file for AMP features.
- Use frequency value = 0 for features that are disabled for a 100% of users.
- Use frequency value = 1 for features visible to a 100% of users (production).
- Use frequency value = 0.01 for features visible to 1% of users (canary).
- If, for some reason, a feature needs to be visible to a fraction of canary
  users, use a fraction of 0.01. For example, 0.0001 == 1% of canary users.

Note: The `canary` key has been moved out of the config JSON file, and is now
added directly to the runtime's `AMP_CONFIG` during the build process.