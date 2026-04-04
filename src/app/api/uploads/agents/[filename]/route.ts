import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);
    
    // Try multiple possible paths for robustness across different environments
    const possiblePaths = [
      join(process.cwd(), 'public/uploads/agents', decodedFilename),
      join(process.cwd(), '.next/standalone/public/uploads/agents', decodedFilename),
      join(process.cwd(), '..', 'public/uploads/agents', decodedFilename),
      // For some Docker/Standalone environments
      join(process.cwd(), '.next/standalone/public/uploads/agents', decodedFilename),
    ];

    let fileBuffer: Buffer | null = null;
    let finalPath = '';

    for (const path of possiblePaths) {
      try {
        fileBuffer = await readFile(path);
        finalPath = path;
        break; 
      } catch (e) {
        // Continue to next path
      }
    }

    if (!fileBuffer) {
      console.error(`File not found across all search paths for: ${decodedFilename}`);
      console.log('Search paths tried:', possiblePaths);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Determine content type based on extension
    const ext = decodedFilename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'webp') contentType = 'image/webp';

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
