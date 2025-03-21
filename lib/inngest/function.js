import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// export const generateIndustryInsights = inngest.createFunction(
//   { id: "generateIndustryInsights", name: "Generate Industry Insights" ,
//      cron: "0 0 * * 0" 
//   },
//   async ({ event, step }) => {
//     console.log(" Received event:", event);
    
//     if (!event.name || event.name !== "generateIndustryInsights") {
//       console.error(" Invalid event name:", event.name);
//       throw new Error("Invalid event name received");
//     }

//     return { message: "Insights generated successfully!" };
//   }
// );

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ event, step }) => {
    // Retrieving only the industry key of each insight row
    // Step name->Fetch industries
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

        // Now using step.ai.wrap to call the api of gemini model and storing response in res
      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await model.generateContent(p);
        },
        prompt
      );

      const text = res.response.candidates[0].content.parts[0].text || "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

      const insights = JSON.parse(cleanedText);
      console.log("This is the end of the gemini API \n",event);
      await step.run(`Update ${industry} insights`, async () => {
        console.log("This is the 3rd step \n",event);
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
);



/*
What Happens Without step?
If the function crashes, it has to start from the beginning.
No logging or tracking of individual steps.
No way to retry specific failed steps—it either all works or all fails
*/
// If we use steps then we can retry only failed steps preventing duplicate API calls.