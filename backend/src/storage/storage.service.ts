import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_KEY');
    this.bucket =
      this.configService.get('SUPABASE_STORAGE_BUCKET') || 'portfolio-media';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const url = new URL(fileUrl);
      const path = url.pathname.split(`/${this.bucket}/`)[1];

      if (!path) {
        throw new BadRequestException('Invalid file URL');
      }

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([path]);

      if (error) {
        throw new BadRequestException(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }
}
