# End-to-End (E2E) Tests

## Overview

Puppeteer-based E2E tests for the Job Autofill Chrome extension. These tests verify:
- iframe form detection and filling
- Real Ashby job application form filling
- Extension message passing between content script and background
- Field classification accuracy

## Requirements

### Installing Puppeteer

**Puppeteer is an optional dependency (~300MB).** It's only required for E2E tests, not for building the extension.

```bash
# Install Puppeteer (one-time setup for E2E tests)
npm install

# Or install temporarily without saving
npm install --no-save puppeteer
```

**Note:** If you only want to build the extension, you don't need Puppeteer. Running `npm install` will skip optional dependencies if they fail.

### Display Server

**Important:** These tests require a display server because Chrome Manifest V3 service workers don't fully support headless mode.

### Local Development (with GUI)

```bash
npm run test:e2e
```

Works on:
- macOS
- Linux with X11/Wayland display
- Windows with WSL2 + X server

### CI/CD or Headless Server

Use `xvfb` (virtual framebuffer) to provide a virtual display:

```bash
# Install xvfb (Ubuntu/Debian)
sudo apt-get install xvfb

# Run tests with xvfb
xvfb-run --auto-servernum --server-args="-screen 0 1280x1024x24" npm run test:e2e
```

## Test Structure

```
tests/e2e/
├── setup/
│   ├── extension-loader.js    # Loads extension in Puppeteer
│   └── test-profile.js         # Mock test data
├── message-passing.test.js     # Extension messaging tests
├── iframe.test.js              # iframe detection/filling
└── ashby-form.test.js          # Real Ashby form test
```

## Running Tests

```bash
# All E2E tests
npm run test:e2e

# Specific test file
npm run test:e2e -- tests/e2e/iframe.test.js

# Watch mode (rebuild + rerun on changes)
npm run test:e2e:watch

# All tests (unit + E2E)
npm run test:all
```

## Test Configuration

- **Timeout:** 30 seconds per test
- **Run mode:** Serial (`--runInBand` flag prevents browser conflicts)
- **Headless:** Requires display server (cannot run in true headless mode)
- **Screenshots:** Saved to `tests/e2e/screenshots/` (gitignored)

## Troubleshooting

### "Puppeteer is not installed"

**Cause:** Puppeteer is an optional dependency and wasn't installed.

**Solution:**
```bash
# Install Puppeteer
npm install

# Or install temporarily
npm install --no-save puppeteer
```

Puppeteer downloads ~300MB Chromium browser and is only needed for E2E tests, not for building the extension.

### "Extension service worker not found"

**Cause:** Extension didn't load properly or service worker didn't initialize.

**Solutions:**
1. Ensure extension is built: `npm run build`
2. Check `dist/manifest.json` exists and is valid
3. Try increasing wait timeout in `extension-loader.js`

### "Missing X server" Error

**Cause:** Running in headless environment without display server.

**Solution:**
```bash
xvfb-run --auto-servernum npm run test:e2e
```

### Tests Hang or Timeout

**Cause:** Browser didn't close properly.

**Solution:**
```bash
# Kill hanging Chrome processes
pkill -f chrome

# Run tests again
npm run test:e2e
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install xvfb
  run: sudo apt-get install -y xvfb

- name: Run E2E Tests
  run: xvfb-run --auto-servernum npm run test:e2e
```

### Docker

Ensure your container has xvfb and Chrome dependencies:

```dockerfile
RUN apt-get update && apt-get install -y \
    xvfb \
    libnss3 libnspr4 libatk1.0-0 \
    libcups2 libdrm2 libxkbcommon0
```

## Limitations

1. **No true headless mode:** MV3 service workers require a display server
2. **Slower than unit tests:** Browser startup adds ~2-3s per test suite
3. **Platform-specific:** May behave differently on different OSes
4. **Flakiness:** Browser-based tests can be timing-sensitive

## Future Improvements

- [ ] Add headless mode support when Chrome adds it
- [ ] Add visual regression testing with screenshots
- [ ] Add dynamic "Add Another" button tests
- [ ] Add field classification accuracy tests
- [ ] Parallelize test suites (requires multiple browsers)
