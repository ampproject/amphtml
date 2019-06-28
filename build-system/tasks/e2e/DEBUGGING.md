## Debugging AMP E2E tests

```sh
node --inspect-brk $(which gulp) e2e
node --inspect-brk $(which gulp) e2e --nobuild # ... etc
```

Include any flags after `e2e` like normal.

Open Chrome DevTools and click the Node logo in the top left.

Click the "Play"/"Continue execution" button to continue execution.

