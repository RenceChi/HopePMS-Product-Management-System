CREATE OR REPLACE VIEW public.top_selling_products AS
SELECT 
  p.prodCode,
  p.description,
  SUM(sd.quantity) AS totalQty
FROM public.product p
JOIN public.salesDetail sd
  ON p.prodCode = sd.prodCode
GROUP BY p.prodCode, p.description
ORDER BY totalQty DESC;