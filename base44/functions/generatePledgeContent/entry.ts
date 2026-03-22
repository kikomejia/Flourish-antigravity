import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Generates learning content for a batch of pledges
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const { pledges } = await req.json();
        // pledges: [{ virtue, title, text }]

        if (!pledges || pledges.length === 0) {
            return Response.json({ error: "No pledges provided" }, { status: 400 });
        }

        const prompt = `
You are creating an educational database for a virtue-building app. For each pledge below, generate concise learning content.

Pledges:
${pledges.map((p, i) => `${i + 1}. Virtue: ${p.virtue} | Title: "${p.title}" | Description: "${p.text}"`).join('\n')}

For EACH pledge, return an object with:
- "virtue": the virtue name (lowercase)
- "pledge_title": the exact pledge title as given
- "practical_takeaway": object with "title" (3-5 words) and "explanation" (1-2 plain English sentences describing the real skill being built)
- "functional_skill": a single plain English sentence describing the specific real-world skill practiced
- "resource": object with "author_source" (book/film/documentary title + author or director) and "why_it_matters" (1 sentence plain English)
- "facts": array of 1-2 fascinating, plain-English facts from psychology, neuroscience, or history that relate to this pledge

Keep language sharp, direct, and jargon-free. Write as if explaining to a curious 16-year-old. No buzzwords or self-help clichés.
`;

        const response_json_schema = {
            type: "object",
            properties: {
                results: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            virtue: { type: "string" },
                            pledge_title: { type: "string" },
                            practical_takeaway: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    explanation: { type: "string" }
                                },
                                required: ["title", "explanation"]
                            },
                            functional_skill: { type: "string" },
                            resource: {
                                type: "object",
                                properties: {
                                    author_source: { type: "string" },
                                    why_it_matters: { type: "string" }
                                },
                                required: ["author_source", "why_it_matters"]
                            },
                            facts: {
                                type: "array",
                                items: { type: "string" }
                            }
                        },
                        required: ["virtue", "pledge_title", "practical_takeaway", "functional_skill", "resource", "facts"]
                    }
                }
            },
            required: ["results"]
        };

        const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema,
            model: "gemini_3_flash"
        });

        return Response.json(llmResponse);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});