export const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-GM', { style: 'currency', currency: 'GMD' }).format(val).replace('GMD', 'D');
};
