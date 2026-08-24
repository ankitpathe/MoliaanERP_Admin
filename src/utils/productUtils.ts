export const getDefaultProductImage = (barcode?: string, name?: string): string => {
  const normName = (name || '').toLowerCase();
  const bc = barcode || '';
  
  if (bc === '8901030753551' || normName.includes('surf excel')) {
    return 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8901491101836' || normName.includes('lays') || normName.includes('chips')) {
    return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8901725181229' || normName.includes('britannia') || normName.includes('marie gold') || normName.includes('britannia marie gold')) {
    return 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8901207040514' || normName.includes('tata salt') || normName.includes('pure salt') || normName.includes('tata pure salt')) {
    return 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8901058002471' || bc === '8901396320015' || normName.includes('dettol') || normName.includes('handwash')) {
    return 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8901166107013' || normName.includes('parle-g') || normName.includes('parle g')) {
    return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8906007281014' || normName.includes('fortune') || normName.includes('oil')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8901262010453' || normName.includes('amul') || normName.includes('butter')) {
    return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8906023241030' || normName.includes('india gate') || normName.includes('rice')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8901058002315' || normName.includes('maggi') || normName.includes('noodles')) {
    return 'https://images.unsplash.com/photo-1612966608997-30024f6f23f0?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8901314510030' || normName.includes('colgate') || normName.includes('toothpaste')) {
    return 'https://images.unsplash.com/photo-1627838377435-0de519525416?q=80&w=300&auto=format&fit=crop';
  }
  if (bc === '8901764032209' || normName.includes('coca-cola') || normName.includes('coke')) {
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop';
  }
  return '';
};
