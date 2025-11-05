
import { GoogleGenAI } from "@google/genai";
import type { FloorPlanRequirements, Units } from '../App';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateFloorPlans(requirements: FloorPlanRequirements, units: Units): Promise<string[]> {
  const {
    plotSize,
    bedrooms,
    bathrooms,
    livingRooms,
    kitchens,
    hasDining,
    hasBalcony,
    hasParking,
  } = requirements;

  const unitString = units === 'metric' ? 'sq.m' : 'sq.ft';

  const prompt = `
Generate 4 clean, professional, architectural 2D floor plan images with these requirements:

- Plot size: ${plotSize} ${unitString}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Living room: ${livingRooms}
- Kitchen: ${kitchens}
- Dining area: ${hasDining ? 'Yes' : 'No'}
- Balcony: ${hasBalcony ? 'Yes' : 'No'}
- Car parking: ${hasParking ? 'Yes' : 'No'}

Design rules:
- Style: A top-down architectural floor plan.
- Content: Include walls, doorways, windows, and standard furniture placement to show scale and function.
- Layout: Ensure a realistic and logical layout flow (e.g., living -> dining -> kitchen, common hall to bedrooms).
- Labels: Clearly label each room and include approximate dimensions.
- Aesthetics: Use a clean, minimalist aesthetic with a white background and black or gray lines for clarity.
- Format: The output must be a high-resolution PNG.
- Variety: Provide 4 distinct and different layout options.
- Overall style: Modern residential layout.
`;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 4,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => img.image.imageBytes);
    } else {
        throw new Error("API did not return any images.");
    }
  } catch (error) {
    console.error("Error generating floor plans:", error);
    throw new Error("Failed to generate floor plans. Please check your API key and try again.");
  }
}
