#!/bin/bash
echo "======================================"
echo "Extension Build Verification"
echo "======================================"
echo ""

echo "✓ Checking icons..."
for size in 16 32 48 128; do
  if [ -f "dist/icons/icon-${size}.png" ]; then
    echo "  ✓ icon-${size}.png exists"
  else
    echo "  ✗ icon-${size}.png MISSING"
  fi
done
echo ""

echo "✓ Checking manifest configuration..."
if grep -q '"all_frames": true' dist/manifest.json; then
  echo "  ✓ all_frames: true configured"
else
  echo "  ✗ all_frames: true NOT FOUND"
fi

if grep -q '"match_about_blank": true' dist/manifest.json; then
  echo "  ✓ match_about_blank: true configured"
else
  echo "  ✗ match_about_blank: true NOT FOUND"
fi
echo ""

echo "✓ Checking content script..."
if grep -q "window.self.*window.top" dist/content.js; then
  echo "  ✓ Frame detection code present"
else
  echo "  ✗ Frame detection code NOT FOUND"
fi
echo ""

echo "✓ Checking test files..."
if [ -f "test-iframe.html" ]; then
  echo "  ✓ test-iframe.html exists"
else
  echo "  ✗ test-iframe.html MISSING"
fi

if [ -f "test-iframe-form.html" ]; then
  echo "  ✓ test-iframe-form.html exists"
else
  echo "  ✗ test-iframe-form.html MISSING"
fi
echo ""

echo "======================================"
echo "Build Verification Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Load extension in Chrome from dist/ folder"
echo "2. Follow TESTING.md for manual testing"
echo "3. Open test-iframe.html in Chrome to test iframe support"
