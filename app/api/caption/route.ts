import { OpenAIStream, StreamingTextResponse } from "ai"
import { PromptTemplate } from "langchain/prompts"
import { Configuration, OpenAIApi } from "openai-edge"

const Template = `
Below is a description of the picture.
Your goal is to:
- Generate 5 social media caption for a picture of the following description. 
- Create an intriguing caption that sparks curiosity and has a positive tone. 
- Include '$' tag at the beginning of every caption. 

Here are some examples:
-Lost in the beauty of the great outdoors, finding solace in nature's embrace. 🌿✨ #NatureTherapy #PeacefulEscape
-Standing tall against all odds, we conquer the challenges that come our way. 💪🌱 #StrengthInUnity #OvercomingObstacles
-On top of the world, with the wind in our hair and a breathtaking view before us. 🌍❤️ #AdventureAwaits #UnforgettableMoments
-Amidst the rolling hills, we find serenity and create memories that will last a lifetime. 🌄💑 #LoveInTheWild #HillsAreAlive
-Witnessing the beauty of nature's canvas, we are reminded of the wonders that surround us. 🎨🌿 #NatureInspired #AweStruck

Below is the sentence:
sentence: {text}

YOUR RESPONSE:
`

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export const runtime = "edge"

export async function POST(request: Request) {
  const res = await request.json()
  const text = res.prompt
  var promptTemplate = Template
  const prompt = new PromptTemplate({
    template: promptTemplate,
    inputVariables: ["text"],
  })
  const promptText = await prompt.format({ text: text })
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    stream: true,
    temperature: 0.9,
    prompt: promptText,
    max_tokens: 500,
  })

  const stream = OpenAIStream(response)

  return new StreamingTextResponse(stream, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
