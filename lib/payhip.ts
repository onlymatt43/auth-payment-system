import axios from 'axios';

const payhipClient = axios.create({
  baseURL: process.env.PAYHIP_API_BASE_URL || 'https://payhip.com/api/v2',
  headers: {
    'product-secret-key': process.env.PAYHIP_API_KEY!,
    Accept: 'application/json'
  },
  timeout: 20_000
});

type PayhipLicenseData = {
  enabled?: boolean;
  product_link?: string;
  license_key?: string;
  buyer_email?: string;
  uses?: number;
  date?: string;
  product_name?: string;
};

type PayhipLicenseResponse = {
  data?: PayhipLicenseData;
  success?: boolean;
  code?: string;
  message?: string;
};

export const validatePayhipCode = async (code: string) => {
  try {
    const response = await payhipClient.get<PayhipLicenseResponse>(
      `/license/verify`,
      { params: { license_key: code } }
    );
    const payload = response.data;

    if (!payload.data || !payload.data.license_key) {
      throw new Error('Licence Payhip introuvable ou invalide');
    }

    if (payload.data.enabled === false) {
      throw new Error('Cette licence a été désactivée');
    }

    // Check if code is older than 60 minutes
    if (payload.data.date) {
      const parsedMs = Date.parse(payload.data.date);
      if (Number.isFinite(parsedMs)) {
        const purchaseDate = new Date(parsedMs);
        const now = new Date();
        const ageInMinutes = (now.getTime() - purchaseDate.getTime()) / (1000 * 60);
        if (ageInMinutes > 60) {
          throw new Error('Ce code a expiré (valide 60 minutes après l\'achat)');
        }
      }
    }

    return {
      licenseKey: payload.data.license_key,
      email: payload.data.buyer_email,
      productId: payload.data.product_link || process.env.PAYHIP_PRODUCT_ID,
      purchasedAt: payload.data.date,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const respData = error.response.data as { message?: string };
      throw new Error(respData?.message || 'Payhip validation failed');
    }
    throw new Error('Unable to reach Payhip');
  }
};