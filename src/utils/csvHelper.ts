import { WordItem } from '../types';

/**
 * 將單字陣列轉換為包含 UTF-8 BOM 的 CSV 字串 (確保 Excel 開啟不亂碼)
 */
export function exportWordsToCSV(words: WordItem[]): string {
  const headers = [
    'levelId',
    'category',
    'word',
    'phonetic',
    'translation',
    'partOfSpeech',
    'exampleEn',
    'exampleZh',
    'hint'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = words.map((w) => [
    w.levelId || 1,
    escapeCSV(w.category || ''),
    escapeCSV(w.word || ''),
    escapeCSV(w.phonetic || ''),
    escapeCSV(w.translation || ''),
    escapeCSV(w.partOfSpeech || ''),
    escapeCSV(w.exampleEn || ''),
    escapeCSV(w.exampleZh || ''),
    escapeCSV(w.hint || '')
  ].join(','));

  // \uFEFF 是 UTF-8 BOM 標頭，讓 Excel 預設用 UTF-8 開啟中文不變亂碼
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * 觸發下載 CSV 檔案
 */
export function downloadCSVFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 解析 CSV 字串為 WordItem 陣列
 */
export function parseCSVToWords(csvText: string): WordItem[] {
  // 清除 BOM 標點
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const lines = parseCSVLines(cleanText);

  if (lines.length <= 1) return [];

  const headers = lines[0].map((h) => h.trim().toLowerCase());
  const words: WordItem[] = [];

  const findIdx = (names: string[]) => headers.findIndex((h) => names.includes(h));

  const levelIdx = findIdx(['levelid', 'level', '關卡', '關卡編號']);
  const categoryIdx = findIdx(['category', '分類', '主題']);
  const wordIdx = findIdx(['word', '單字', '英文']);
  const phoneticIdx = findIdx(['phonetic', '音標', 'kk音標']);
  const transIdx = findIdx(['translation', '中文', '翻譯', '中文翻譯']);
  const posIdx = findIdx(['partofspeech', 'pos', '詞性']);
  const exEnIdx = findIdx(['exampleen', '例句en', '英文例句']);
  const exZhIdx = findIdx(['examplezh', '例句zh', '中文例句']);
  const hintIdx = findIdx(['hint', '提示']);

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row || row.length === 0 || !row.some((cell) => cell.trim())) continue;

    const wordStr = row[wordIdx >= 0 ? wordIdx : 2]?.trim();
    const transStr = row[transIdx >= 0 ? transIdx : 4]?.trim();

    if (!wordStr || !transStr) continue;

    const parsedLevel = parseInt(row[levelIdx >= 0 ? levelIdx : 0] || '1', 10);
    const levelId = isNaN(parsedLevel) || parsedLevel <= 0 ? 1 : parsedLevel;

    words.push({
      id: `w_custom_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}`,
      levelId,
      category: row[categoryIdx >= 0 ? categoryIdx : 1]?.trim() || '自訂單字',
      word: wordStr,
      phonetic: row[phoneticIdx >= 0 ? phoneticIdx : 3]?.trim() || '',
      translation: transStr,
      partOfSpeech: row[posIdx >= 0 ? posIdx : 5]?.trim() || 'n.',
      exampleEn: row[exEnIdx >= 0 ? exEnIdx : 6]?.trim() || '',
      exampleZh: row[exZhIdx >= 0 ? exZhIdx : 7]?.trim() || '',
      hint: row[hintIdx >= 0 ? hintIdx : 8]?.trim() || '',
    });
  }

  return words;
}

/**
 * 處理包含引號與換行的標準 CSV 解析
 */
function parseCSVLines(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(current);
      result.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current || row.length > 0) {
    row.push(current);
    result.push(row);
  }

  return result;
}
