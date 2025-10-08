import { getRandomCardFromIndexedDB } from 'db';

// --- Shared AI JSON Helper ---
async function getJsonFromAI(systemPrompt, userPrompt) {
  try {
    const completion = await websim.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      json: true, // ensures JSON-only response
    });

    return JSON.parse(completion.content);
  } catch (error) {
    console.error("Error fetching AI completion:", error);
    return {
      error: "Failed to get a valid JSON response from the AI.",
    };
  }
}


// --- Generate Pogemon Description ---
export async function getPokemonDescription(lastCard = null) {
  try {
    const randomExistingCard = await getRandomCardFromIndexedDB();
    const randomSeed = Math.floor(Math.random() * 1_000_000) + 1;

    // --- System prompt: schema and rules ---
    const systemPrompt = `Generate a creative description for a completely new, unique Pogemon.
The name should be original and meaningful, derived from a combination of Latin, Greek, or English root words related to its characteristics.
Be imaginative and original – do not reuse existing Pogemons.
Include its type (one or two words maximum, like "Fire", "Water/Flying"), height, weight, and a brief poetic description of its appearance and behavior.
Capture the whimsical and magical nature of the Pogemon world.
Respond ONLY with JSON matching this schema:
{
  "name": "string",
  "description": "string", 
  "type": "string",
  "height": "string",
  "weight": "string"
}
Example response (generate something completely different):
{
  "name": "Pyroxian",
  "description": "A mystical fire-psychic Pogemon whose crystalline body channels volcanic energies into mesmerizing displays of mental prowess. Its presence warms the mind as much as the air around it.",
  "type": "Fire/Psychic",
  "height": "1.8m",
  "weight": "45kg"
}`;

    // --- Dynamic user context ---
    let userPrompt = `Random seed for inspiration: ${randomSeed}\n`;

    if (lastCard) {
      userPrompt += `
The last generated Pogemon was:
Name: ${lastCard.name}
Type: ${lastCard.type}
Please ensure this generation is different in both name theme and type.\n`;
    }

    if (randomExistingCard) {
      userPrompt += `
A random Pogemon from the user's collection:
Name: ${randomExistingCard.name}
Type: ${randomExistingCard.type}
Description: ${randomExistingCard.description}
Please ensure this new Pogemon is unique and distinct from both the previous and this random card.\n`;
    }

    // --- Use shared JSON AI helper ---
    const result = await getJsonFromAI(systemPrompt, userPrompt);

    if (result.error) throw new Error(result.error);
    return result;
  } catch (error) {
    console.error("Error fetching Pogemon description:", error);
    return {
      name: "Error",
      description: "Failed to generate Pogemon description",
      type: "Unknown",
      height: "Unknown",
      weight: "Unknown",
    };
  }
}

// --- Generate Pogemon Image ---
export async function generatePokemonImage(description) {
  try {
    const result = await websim.imageGen({
      prompt: description,
      aspect_ratio: "1:1",
    });
    return result.url;
  } catch (error) {
    console.error("Error generating Pogemon image:", error);
    return null;
  }
}

