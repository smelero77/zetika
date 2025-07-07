import fetch from 'node-fetch';
import { supabaseAdmin } from '~/server/lib/supabase';
import { logger } from '~/server/lib/logger';

export async function fetchAndStoreDocument(
  bdns: string,
  docId: number
): Promise<{ storagePath: string; publicUrl: string }> {
  const remoteUrl = `https://www.infosubvenciones.es/bdnstrans/GE/es/convocatoria/${bdns}/document/${docId}`;
  logger.info('📥 Descargando documento', { bdns, docId, remoteUrl });

  const res = await fetch(remoteUrl);
  if (!res.ok) {
    throw new Error(`Falló download (${res.status}) ${remoteUrl}`);
  }

  const buffer = await res.arrayBuffer();
  const path   = `${bdns}/${docId}.pdf`;

  const { error } = await supabaseAdmin
    .storage
    .from('docs')
    .upload(path, Buffer.from(buffer), {
      contentType: 'application/pdf',
      upsert: true,
    });
  if (error) throw error;

  const { data } = supabaseAdmin
    .storage
    .from('docs')
    .getPublicUrl(path);

  logger.info('☁️ Documento guardado en storage', { path, publicUrl: data.publicUrl });
  return { storagePath: path, publicUrl: data.publicUrl };
} 