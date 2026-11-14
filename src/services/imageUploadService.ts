/**
 * Processa a imagem somente no navegador. A imagem fica disponível na sessão
 * local como Data URL e não é enviada para nenhum serviço externo.
 */
export async function uploadPropertyImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
