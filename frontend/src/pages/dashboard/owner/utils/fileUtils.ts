// src/pages/dashboard/utils/fileUtils.ts

export const getFileType = (filename: string): 'image' | 'video' | 'document' => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
  if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext || '')) return 'video';
  return 'document';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getCloudinaryResourceType = (file: File): string => {
  const fileType = getFileType(file.name);
  switch (fileType) {
    case 'video': return 'video';
    case 'image': return 'image';
    default: return 'raw'; // For documents
  }
};