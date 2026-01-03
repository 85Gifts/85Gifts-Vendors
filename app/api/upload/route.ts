import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to handle image uploads to Cloudinary
 * This route securely handles uploads server-side to protect Cloudinary credentials
 */
export async function POST(request: NextRequest) {
  try {
    // Check for Cloudinary environment variables
    // For unsigned uploads (simpler, less secure):
    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryUploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    
    // For signed uploads (more secure, recommended for production):
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

    // Use signed uploads if API key and secret are provided, otherwise fall back to unsigned
    const useSignedUpload = !!(cloudinaryApiKey && cloudinaryApiSecret);

    if (!cloudinaryCloudName) {
      return NextResponse.json(
        { error: 'Cloudinary cloud name is missing' },
        { status: 500 }
      );
    }

    if (!useSignedUpload && !cloudinaryUploadPreset) {
      return NextResponse.json(
        { error: 'Cloudinary upload preset is required for unsigned uploads. Please provide CLOUDINARY_UPLOAD_PRESET or use signed uploads with CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET' },
        { status: 500 }
      );
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to base64 data URI for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Create FormData for Cloudinary upload
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', dataUri);
    cloudinaryFormData.append('folder', '85gifts-vendors/products'); // Optional: organize uploads in a folder

    // For signed uploads, generate signature
    if (useSignedUpload && cloudinaryApiKey && cloudinaryApiSecret) {
      // Generate timestamp
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      // Build parameters for signature (sorted alphabetically)
      const params: Record<string, string> = {
        folder: '85gifts-vendors/products',
        timestamp: timestamp.toString(),
      };
      
      // Generate signature: SHA1 hash of sorted params + secret
      const crypto = await import('crypto');
      const paramsString = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      const signature = crypto.createHash('sha1').update(paramsString + cloudinaryApiSecret).digest('hex');
      
      cloudinaryFormData.append('timestamp', timestamp.toString());
      cloudinaryFormData.append('api_key', cloudinaryApiKey);
      cloudinaryFormData.append('signature', signature);
    } else {
      // Use unsigned upload with preset (simpler, but less secure)
      if (cloudinaryUploadPreset) {
        cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset);
      }
    }

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`;
    
    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    if (!cloudinaryResponse.ok) {
      const error = await cloudinaryResponse.json().catch(() => ({ error: 'Cloudinary upload failed' }));
      console.error('Cloudinary upload error:', error);
      return NextResponse.json(
        { error: error.error || 'Failed to upload to Cloudinary' },
        { status: cloudinaryResponse.status }
      );
    }

    const cloudinaryData = await cloudinaryResponse.json();

    // Return the secure URL
    return NextResponse.json({
      secure_url: cloudinaryData.secure_url,
      public_id: cloudinaryData.public_id,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
      format: cloudinaryData.format,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

