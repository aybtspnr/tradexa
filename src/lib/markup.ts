"use client";

/**
 * Calcula o preço final com base no markup da plataforma.
 * O markup atual é de 5%.
 */
export const calculateFinalPrice = (basePrice: number): number => {
  if (!basePrice || isNaN(basePrice)) return 0;
  const markup = 0.05; // 5% de markup
  return basePrice * (1 + markup);
};

export const getMarkupPercentage = () => 5;