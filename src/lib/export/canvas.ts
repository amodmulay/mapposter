import { jsPDF } from 'jspdf';
import maplibregl from 'maplibre-gl';

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf' | 'svg';
  title: string;
  subtitle: string;
  center: [number, number];
  theme: any;
  width: number;
  height: number;
  showPin?: boolean;
  padding?: number;
  pinColor?: string;
  pinIcon?: 'pin' | 'heart' | 'home';
  titleColor?: string;
  subtitleColor?: string;
  coordsColor?: string;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
  letterSpacing?: number;
}

/**
 * Utility to convert canvas.toBlob into a Promise
 */
const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
};

/**
 * Wait for the map to finish rendering tiles and symbols.
 */
function waitForMapIdle(map: maplibregl.Map): Promise<void> {
  return new Promise((resolve) => {
    if (map.loaded()) {
      resolve();
      return;
    }
    map.once('idle', () => resolve());
  });
}

/**
 * Draws an icon marker at the given pixel coordinates.
 * Supports 'pin', 'heart', and 'home' icons.
 */
function drawMarker(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string, icon: string) {
  const size = 40 * scale;
  ctx.save();

  if (icon === 'heart') {
    // Draw a heart shape
    const s = size * 0.6;
    ctx.translate(x, y - s * 0.4);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s * 0.8);
    ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.35);
    ctx.fill();
  } else if (icon === 'home') {
    // Draw a simple house
    const s = size * 0.5;
    ctx.translate(x, y - s);
    ctx.fillStyle = color;
    // Roof (triangle)
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(-s * 0.7, s * 0.1);
    ctx.lineTo(s * 0.7, s * 0.1);
    ctx.closePath();
    ctx.fill();
    // Body (rectangle)
    ctx.fillRect(-s * 0.5, s * 0.1, s, s * 0.7);
    // Door (white cutout)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-s * 0.15, s * 0.4, s * 0.3, s * 0.4);
  } else {
    // Default pin
    ctx.translate(x, y - (size / 2));
    // Pin Body
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
    ctx.fill();
    // Pin Point
    ctx.beginPath();
    ctx.moveTo(-size / 4, 0);
    ctx.lineTo(0, size / 2);
    ctx.lineTo(size / 4, 0);
    ctx.fill();
    // White center
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(0, 0, size / 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Text renderer with support for underline
 */
function fillTextStyled(
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  underline: boolean,
  fontSize: number
) {
  ctx.fillText(text, x, y);
  
  if (underline) {
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const underlineHeight = Math.max(1, fontSize / 15);
    
    ctx.save();
    ctx.fillRect(x - textWidth / 2, y + (fontSize / 4), textWidth, underlineHeight);
    ctx.restore();
  }
}

export async function exportPoster(map: maplibregl.Map, options: ExportOptions) {
  const { 
    format, title, subtitle, center, theme, 
    width: targetWidth, height: targetHeight, 
    showPin = true, padding = 0, 
    pinColor = '#ef4444', pinIcon = 'pin',
    titleColor = '#0f172a', subtitleColor = '#64748b', coordsColor = '#94a3b8',
    italic = false, underline = false,
    fontFamily = 'serif', letterSpacing = 0
  } = options;
  console.log(`[Export] Starting ${format} export for: ${title} (${targetWidth}x${targetHeight}, padding: ${padding})`);
  
  // The content area is the target size minus padding on each side
  const contentWidth = targetWidth - (padding * 2);
  const contentHeight = targetHeight - (padding * 2);

  // Label area takes exactly 1/4 of the content height
  const labelAreaHeight = contentHeight * 0.25;
  const mapWidth = contentWidth;
  const mapHeight = contentHeight * 0.75;

  const baseWidth = 1200;
  const baseHeight = Math.round(baseWidth * (mapHeight / mapWidth));
  
  const container = document.createElement('div');
  
  container.style.width = `${baseWidth}px`;
  container.style.height = `${baseHeight}px`;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const pixelRatio = mapWidth / baseWidth;

  const offscreenMap = new maplibregl.Map({
    container,
    style: map.getStyle(),
    center: map.getCenter(),
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    interactive: false,
    attributionControl: false,
    pixelRatio,
    canvasContextAttributes: { preserveDrawingBuffer: true }
  });

  // --- PHASE 1: Render map to a 2D canvas (GPU-heavy) ---
  await waitForMapIdle(offscreenMap);
  console.log(`[Export] Offscreen map idle and ready.`);

  const glCanvas = offscreenMap.getCanvas();
  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Final canvas size is exactly the target dimensions
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;

  // 1. Draw Background (white, this creates the padding effect)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // 2. Draw Map (centered within padding)
  ctx.drawImage(glCanvas, padding, padding, mapWidth, mapHeight);

  // 3. Draw Pin (Manual Projection)
  if (showPin) {
    const point = offscreenMap.project(center);
    const pinX = (point.x * pixelRatio) + padding;
    const pinY = (point.y * pixelRatio) + padding;
    drawMarker(ctx, pinX, pinY, targetWidth / 2400, pinColor, pinIcon);
  }

  // --- PHASE 2: Destroy the offscreen map IMMEDIATELY to free GPU memory ---
  offscreenMap.remove();
  if (document.body.contains(container)) {
    document.body.removeChild(container);
  }

  // --- PHASE 3: Draw labels on the 2D canvas ---
  const scale = targetWidth / 2400;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = tempCanvas.width / 2;
  // The center of the label area is exactly halfway between the map's bottom and the canvas's padding edge
  const labelSectionCenterY = padding + mapHeight + (labelAreaHeight / 2);
  const fontStyle = italic ? 'italic ' : '';
  
  // Font Family mapping
  const fontName = fontFamily === 'serif' ? 'serif' : fontFamily;
  
  // Apply letter spacing (modern browsers)
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = `${letterSpacing * scale}px`;
  }

  // Title (drawn slightly above center)
  const titleSize = Math.round(48 * scale);
  ctx.fillStyle = titleColor;
  ctx.font = `${fontStyle}bold ${titleSize}px "${fontName}"`;
  fillTextStyled(ctx, title.toUpperCase(), centerX, labelSectionCenterY - (Math.round(45 * scale)), underline, titleSize);

  // Subtitle (drawn slightly below center)
  const subtitleSize = Math.round(20 * scale);
  ctx.fillStyle = subtitleColor;
  ctx.font = `${fontStyle}${subtitleSize}px "${fontName}"`;
  fillTextStyled(ctx, subtitle.toUpperCase(), centerX, labelSectionCenterY + (Math.round(15 * scale)), underline, subtitleSize);

  // Coordinates (drawn below subtitle)
  const coordsSize = Math.round(12 * scale);
  ctx.fillStyle = coordsColor;
  const coordsFont = fontFamily === 'serif' ? 'monospace' : `"${fontName}"`;
  ctx.font = `${fontStyle}${coordsSize}px ${coordsFont}`;
  const coords = `${center[1].toFixed(4)}° N / ${center[0].toFixed(4)}° E`;
  fillTextStyled(ctx, coords, centerX, labelSectionCenterY + (Math.round(60 * scale)), underline, coordsSize);

  // --- PHASE 4: Generate file and save (no GPU resources held) ---
  const filename = `map-poster-${title.toLowerCase().replace(/\s+/g, '-')}.${format}`;
  console.log(`[Export] PHASE 4: Generating ${format} file...`);

  if (format === 'png' || format === 'jpeg') {
    const mimeType = `image/${format}`;
    const blob = await canvasToBlob(tempCanvas, mimeType, 0.95);
    if (!blob) throw new Error('Blob generation failed');
    console.log(`[Export] Blob created: ${(blob.size / 1024).toFixed(0)} KB`);
    
    tempCanvas.width = 0;
    tempCanvas.height = 0;
    
    saveFile(blob, filename, mimeType);
    console.log(`[Export] Save complete.`);
    
  } else if (format === 'pdf') {
     const canvasW = tempCanvas.width;
     const canvasH = tempCanvas.height;
     
     const pdf = new jsPDF({
       orientation: 'portrait',
       unit: 'px',
       format: [canvasW, canvasH],
       compress: true
     });
     
     const imgData = tempCanvas.toDataURL('image/jpeg', 0.9);
     
     tempCanvas.width = 0;
     tempCanvas.height = 0;
     
     pdf.addImage(imgData, 'JPEG', 0, 0, canvasW, canvasH);
     pdf.save(filename);
  }
}

/**
 * Save a file by triggering a direct download to the user's Downloads folder.
 * We intentionally avoid showSaveFilePicker because it uses a native Windows
 * dialog that freezes Chrome when navigating to special shell folders (e.g. Gallery).
 */
function saveFile(blob: Blob, filename: string, _mimeType: string) {
  console.log(`[Export/saveFile] Direct download: ${filename} (${(blob.size / 1024).toFixed(0)} KB)`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  // Clean up after a delay to ensure the browser has started the download
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 10000);
  console.log(`[Export/saveFile] Download triggered.`);
}
