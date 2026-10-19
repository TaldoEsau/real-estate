import { supabase } from './supabaseClient';
import { generateUUID } from '../utils/formatters';

/**
 * Uploads an image file to Supabase Storage ('property-images' bucket)
 * with automatic fallback to base64 Data URL for zero-friction local and offline testing.
 */
export async function uploadPropertyImage(file: File): Promise<string> {
  // 1. If Supabase is available, attempt cloud storage upload
  if (supabase) {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanName = `${Date.now()}-${generateUUID().slice(0, 8)}.${ext}`;
      const filePath = `properties/${cleanName}`;

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload error, falling back to Data URL:', err);
    }
  }

  // 2. Client-side Base64 Data URL fallback (instant, offline-ready)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
