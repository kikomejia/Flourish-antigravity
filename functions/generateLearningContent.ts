import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const { activityLogs, userName } = await req.json();

        if (!activityLogs || activityLogs.length === 0) {
            return Response.json({ error: "No activities provided" }, { status: 400 });
        }

        const prompt = `
The user "${userName || "a seeker"}" has completed the following virtues, pledges, and challenges today:

${activityLogs.map(act => `- Virtue: ${act.virtue}, Type: ${act.activity_type}, Title: "${act.title}", Description: "${act.text}"`).join('\n')}

Based on exactly these completed activities, generate a rich, personalized learning summary. Be highly specific — reference their actual activities, not generic advice. Use a sharp, intelligent tone that is completely free of jargon. Write as if explaining to a curious 16-year-old who has never studied philosophy or psychology. No buzzwords, no academic terms, no self-help clichés. Plain, direct, honest English only.

Return a JSON object with:
- "practical_takeaways": array of objects. Each one is a grounded, specific insight about what real skill the user is building. Each object must have: "virtue" (the virtue name it relates to, e.g. "courage"), "title" (2-5 word name for the insight), "explanation" (1-2 plain English sentences explaining the skill being built).
- "virtues_as_functional_skills": array of objects with "virtue" (string) and "skill" (string). Map each completed virtue to a specific, real-world skill they practiced. No jargon.
- "hard_hitting_resources": array of objects with "virtue" (string), "author_source" (string), and "why_it_matters" (string). Suggest 1 book or film per virtue that directly relates to what they practiced. Explain why in plain English.
- "real_world_facts": array of strings. Each is a fascinating, easy-to-understand fact from psychology, neuroscience, or history that directly relates to one of their completed activities. No technical terms.
`;

        const response_json_schema = {
            type: "object",
            properties: {
                practical_takeaways: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            virtue: { type: "string" },
                            title: { type: "string" },
                            explanation: { type: "string" }
                        },
                        required: ["virtue", "title", "explanation"]
                    }
                },
                virtues_as_functional_skills: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: { virtue: { type: "string" }, skill: { type: "string" } },
                        required: ["virtue", "skill"]
                    }
                },
                hard_hitting_resources: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            virtue: { type: "string" },
                            author_source: { type: "string" },
                            why_it_matters: { type: "string" }
                        },
                        required: ["virtue", "author_source", "why_it_matters"]
                    }
                },
                real_world_facts: { type: "array", items: { type: "string" } }
            },
            required: ["practical_takeaways", "virtues_as_functional_skills", "hard_hitting_resources", "real_world_facts"]
        };

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema,
            model: "gemini_3_flash"
        });

        return Response.json(llmResponse);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});