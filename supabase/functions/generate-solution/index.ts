
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionCode } = await req.json()

    if (!sessionCode) {
      return new Response(
        JSON.stringify({ error: 'Session code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch session data
    const { data: session, error: fetchError } = await supabaseClient
      .from('sessions')
      .select('*')
      .eq('session_code', sessionCode)
      .single()

    if (fetchError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if both perspectives are submitted
    if (!session.partner1_perspective || !session.partner2_perspective) {
      return new Response(
        JSON.stringify({ error: 'Both partners must submit their perspectives first' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if solution already exists
    if (session.solution) {
      return new Response(
        JSON.stringify({ solution: session.solution }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare the prompt for Google Gemini
    const prompt = `You are an expert relationship counselor and mediator. Two partners in a relationship have shared their perspectives about a conflict. Please provide a thoughtful, balanced mediation response that helps them understand each other and find resolution.

Partner 1 (${session.partner1_name || 'Partner 1'}): "${session.partner1_perspective}"

Partner 2 (${session.partner2_name || 'Partner 2'}): "${session.partner2_perspective}"

Please provide a response that:
1. Acknowledges both perspectives with empathy
2. Identifies common ground and shared values
3. Suggests specific, actionable steps for resolution
4. Promotes healthy communication patterns
5. Is supportive and constructive

Format your response as a thoughtful mediation that both partners can read together.`

    // Call Google Gemini API
    const geminiApiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', await geminiResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to generate solution' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()
    const solution = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!solution) {
      console.error('No solution generated from Gemini:', geminiData)
      return new Response(
        JSON.stringify({ error: 'No solution generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update session with the generated solution
    const { error: updateError } = await supabaseClient
      .from('sessions')
      .update({ solution })
      .eq('session_code', sessionCode)

    if (updateError) {
      console.error('Error updating session:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to save solution' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ solution }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-solution function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
