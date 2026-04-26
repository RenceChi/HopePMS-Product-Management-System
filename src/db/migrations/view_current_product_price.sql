CREATE OR REPLACE VIEW public.current_product_price AS
SELECT DISTINCT ON (ph.prodCode)
  ph.prodCode,
  ph.unitPrice,
  ph.effDate
FROM public.priceHist ph
ORDER BY ph.prodCode, ph.effDate DESC;