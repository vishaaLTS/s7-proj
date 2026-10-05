import mammoth from 'mammoth';
import zlib from 'zlib';

export async function extractTextFromDocxAsync(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    if (result.value && result.value.trim().length > 0) {
      return result.value.replace(/\s+/g, ' ').trim();
    }
  } catch (err) {
    console.warn('Mammoth DOCX parsing failed, trying raw XML parser:', err);
  }
  return extractTextFromDocxSyncFallback(buffer);
}

export function extractTextFromDocx(buffer: Buffer): string {
  return extractTextFromDocxSyncFallback(buffer);
}

function extractTextFromDocxSyncFallback(buffer: Buffer): string {
  try {
    const targetPath = 'word/document.xml';
    let offset = 0;

    while (offset < buffer.length - 30) {
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const filenameLength = buffer.readUInt16LE(offset + 26);
        const extraFieldLength = buffer.readUInt16LE(offset + 28);

        const filename = buffer.toString('utf8', offset + 30, offset + 30 + filenameLength);

        if (filename === targetPath) {
          const dataStart = offset + 30 + filenameLength + extraFieldLength;
          const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);

          let xmlContent = '';
          if (compressionMethod === 8) {
            const decompressed = zlib.inflateRawSync(compressedData);
            xmlContent = decompressed.toString('utf8');
          } else if (compressionMethod === 0) {
            xmlContent = compressedData.toString('utf8');
          }

          const matches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
          if (matches) {
            return matches
              .map((m) => m.replace(/<[^>]+>/g, ''))
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          }

          return xmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }

        offset += 30 + filenameLength + extraFieldLength + compressedSize;
      } else {
        offset++;
      }
    }

    return buffer
      .toString('utf8')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (err) {
    console.error('Error extracting text from DOCX:', err);
    return buffer
      .toString('utf8')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
