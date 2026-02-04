import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient<any, any, any>;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    this.bucket =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ||
      'portfolio-media';

    this.logger.log(`Initializing StorageService with bucket: ${this.bucket}`);

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Supabase client initialized successfully');
  }

  /**
   * Sanitize filename to remove special characters, accents, and spaces
   * Only allows alphanumeric characters, hyphens, underscores, and dots
   */
  private sanitizeFilename(filename: string): string {
    this.logger.debug(`Original filename: ${filename}`);

    // Get file extension
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename;
    const extension = lastDotIndex > 0 ? filename.slice(lastDotIndex) : '';

    // Normalize unicode characters (decompose accented characters)
    // Then remove diacritical marks (accents)
    const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Replace spaces and special characters with underscores
    // Only keep alphanumeric, hyphens, and underscores
    const sanitized = normalized
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

    const result = `${sanitized}${extension.toLowerCase()}`;
    this.logger.debug(`Sanitized filename: ${result}`);

    return result;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    this.logger.log('=== UPLOAD FILE REQUEST ===');
    this.logger.log(`Folder: ${folder}`);

    if (!file) {
      this.logger.error('No file provided in request');
      throw new BadRequestException('No file provided');
    }

    this.logger.log(`Original filename: ${file.originalname}`);
    this.logger.log(`Mimetype: ${file.mimetype}`);
    this.logger.log(`Size: ${file.size} bytes`);

    const sanitizedFilename = this.sanitizeFilename(file.originalname);
    const fileName = `${folder}/${Date.now()}-${sanitizedFilename}`;

    this.logger.log(`Final storage path: ${fileName}`);
    this.logger.log(`Target bucket: ${this.bucket}`);

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      this.logger.error(`Error details: ${JSON.stringify(error)}`);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    this.logger.log(`Upload successful! Path: ${data.path}`);

    // Get public URL
    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    this.logger.log(`Public URL: ${publicUrlData.publicUrl}`);
    this.logger.log('=== UPLOAD COMPLETE ===');

    return publicUrlData.publicUrl;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    this.logger.log('=== DELETE FILE REQUEST ===');
    this.logger.log(`File URL: ${fileUrl}`);

    try {
      // Extract path from URL
      const url = new URL(fileUrl);
      const path = url.pathname.split(`/${this.bucket}/`)[1];

      this.logger.log(`Extracted path: ${path}`);

      if (!path) {
        this.logger.error('Invalid file URL - could not extract path');
        throw new BadRequestException('Invalid file URL');
      }

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([path]);

      if (error) {
        this.logger.error(`Delete failed: ${error.message}`);
        throw new BadRequestException(`Delete failed: ${error.message}`);
      }

      this.logger.log('=== DELETE COMPLETE ===');
    } catch (error) {
      this.logger.error(`Failed to delete file: ${(error as Error).message}`);
      throw new BadRequestException(
        `Failed to delete file: ${(error as Error).message}`,
      );
    }
  }
}
