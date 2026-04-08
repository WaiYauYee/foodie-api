// foodSegmentationService.ts
interface SegmentationResponse {
  success: boolean;
  segmentation_id?: string;
  ingredients?: string[];  // ✅ Array of strings, NOT objects!
  overlayImage?: string;
  error?: string;
}

export const segmentFoodImage = async (base64Image: string): Promise<SegmentationResponse> => {
  try {
    console.log("🔄 Starting segmentation...");
 
    // Convert base64 to blob
    const base64Data = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;
 
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
 
    console.log("✅ Blob created:", blob.size, "bytes");
 
    // Create FormData
    const formData = new FormData();
    formData.append('image', blob, 'food-image.jpg');
 
    // Send to Node.js backend
    console.log("📤 Sending to backend...");
    const response = await fetch('http://localhost:3001/api/food/segment', {
      method: 'POST',
      body: formData,
    });
 
    console.log("📥 Backend response status:", response.status);
 
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error:", errorText);
      throw new Error(`API error: ${response.statusText}`);
    }
 
    const data: SegmentationResponse = await response.json();
 
    console.log("✅ Response received:");
    console.log("  - Success:", data.success);
    console.log("  - Segmentation ID:", data.segmentation_id);
    console.log("  - Ingredients:", data.ingredients);  // Array of strings
    console.log("  - Ingredients type:", typeof data.ingredients, Array.isArray(data.ingredients));
    console.log("  - Has overlayImage?", !!data.overlayImage);
 
    return data;
 
  } catch (error) {
    console.error('❌ Segmentation error:', error);
    throw error;
  }
};