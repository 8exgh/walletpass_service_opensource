# Pass Image Assets

This directory contains image assets for Apple Wallet passes.

## Required Images

Apple Wallet passes support the following image files:

### Icon (Required)
- `icon.png` - 29x29 pixels
- `icon@2x.png` - 58x58 pixels
- `icon@3x.png` - 87x87 pixels

The icon is displayed in various places including:
- Mail and Messages when passing a pass
- Notification from apps
- Lock screen notifications

### Logo (Optional)
- `logo.png` - 160x50 pixels max
- `logo@2x.png` - 320x100 pixels max
- `logo@3x.png` - 480x150 pixels max

The logo is displayed in the pass header.

### Other Optional Images

#### Background
- `background.png` - 180x220 pixels
- `background@2x.png` - 360x440 pixels

#### Strip
- `strip.png` - 320x84 pixels
- `strip@2x.png` - 640x168 pixels
- `strip@3x.png` - 960x252 pixels

#### Thumbnail
- `thumbnail.png` - 90x90 pixels
- `thumbnail@2x.png` - 180x180 pixels
- `thumbnail@3x.png` - 270x270 pixels

## Image Guidelines

1. Use PNG format
2. Images should not contain transparency
3. Use sRGB color space
4. Optimize file sizes (keep total pass under 10MB)
5. Test on actual devices for best results

## Creating Sample Images

For testing, you can create simple colored rectangles:

```bash
# Create a simple icon using ImageMagick
convert -size 58x58 xc:blue icon@2x.png
convert -size 29x29 xc:blue icon.png
convert -size 87x87 xc:blue icon@3x.png

# Create a logo
convert -size 320x100 xc:navy -gravity center -fill white -pointsize 24 -annotate +0+0 "PASS" logo@2x.png
```