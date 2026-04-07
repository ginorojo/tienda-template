import * as XLSX from 'xlsx';

export interface ExcelProduct {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
}

export interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
  total: number;
}

export const REQUIRED_COLUMNS = ['sku', 'name', 'price', 'stock'];
export const OPTIONAL_COLUMNS = ['description', 'image_url', 'weight', 'width', 'height', 'length'];

/**
 * Valida si las cabeceras del Excel contienen las columnas requeridas
 */
export function validateExcelHeaders(headers: string[]): { valid: boolean; missing: string[] } {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const missing = REQUIRED_COLUMNS.filter(col => !normalizedHeaders.includes(col));
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Procesa el archivo Excel y devuelve un array de productos validados
 */
export async function parseExcelFile(file: File): Promise<{ products: ExcelProduct[], errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        if (jsonData.length === 0) {
          resolve({ products: [], errors: ['El archivo está vacío'] });
          return;
        }

        const headers = Object.keys(jsonData[0]);
        const validation = validateExcelHeaders(headers);

        if (!validation.valid) {
          resolve({ 
            products: [], 
            errors: [`Faltan columnas requeridas: ${validation.missing.join(', ')}`] 
          });
          return;
        }

        const products: ExcelProduct[] = [];
        const errors: string[] = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // +1 por 0-index, +1 por cabecera
          
          // Validación de fila incompleta
          if (!row.sku || !row.name || row.price === undefined || row.stock === undefined) {
             errors.push(`Fila ${rowNum}: Datos incompletos (requiere sku, name, price, stock)`);
             return;
          }

          const price = parseFloat(row.price);
          const stock = parseInt(row.stock);

          if (isNaN(price)) {
            errors.push(`Fila ${rowNum}: El precio "${row.price}" no es un número válido`);
            return;
          }

          if (isNaN(stock)) {
            errors.push(`Fila ${rowNum}: El stock "${row.stock}" no es un número válido`);
            return;
          }

          products.push({
            sku: String(row.sku).trim(),
            name: String(row.name).trim(),
            description: row.description ? String(row.description).trim() : '',
            price: price,
            stock: stock,
            image_url: row.image_url ? String(row.image_url).trim() : '',
            weight: row.weight ? parseFloat(row.weight) : 1.0,
            width: row.width ? parseInt(row.width) : 10,
            height: row.height ? parseInt(row.height) : 10,
            length: row.length ? parseInt(row.length) : 10,
          });
        });

        resolve({ products, errors });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
}
