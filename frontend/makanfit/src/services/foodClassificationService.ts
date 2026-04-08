// frontend/makanfit/src/services/foodClassificationService.ts

export interface ClassificationPrediction {
  class_id: number;
  food_name: string;
  confidence: number;
  percentage: number;
  rank?: number;
}

export interface ClassificationModelInfo {
  device: string;
  input_size: number;
  model_type: string;
  num_classes: number;
}

export interface ClassificationResponse {
  success: boolean;
  primary_prediction?: ClassificationPrediction;
  all_predictions?: ClassificationPrediction[];
  model_info?: ClassificationModelInfo;
  error?: string;
}

/**
 * Send a base64 image to the backend for food classification
 */
export const classifyFoodImage = async (base64Image: string): Promise<ClassificationResponse> => {
  try {
    // Convert base64 to Blob
    const byteCharacters = atob(base64Image.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Create FormData
    const formData = new FormData();
    formData.append('image', blob, 'food-image.jpg');

    // Send to Node.js backend endpoint (classificationClient)
    const response = await fetch('http://localhost:3001/api/food/classify', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data: ClassificationResponse = await response.json();
    return data;

  } catch (error: any) {
    console.error('Classification error:', error);
    return {
      success: false,
      error: error.message || 'Unknown classification error',
    };
  }
};
