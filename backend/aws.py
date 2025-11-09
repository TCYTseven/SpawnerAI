import boto3
import json
import os
import dotenv
dotenv.load_dotenv()

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1",
    aws_access_key_id=os.getenv("awsid"),
    aws_secret_access_key=os.getenv("awssecret")
)

def onboarding(skills, onboarding_data):
    prompt = '''You are an expert game data and player-behavior analyst. Your job is to take structured multi-game player onboarding data and generate a JSON recommendation profile that powers our app’s League of Legends onboarding experience.

This app helps new players transition into League from other games (Fortnite, Valorant, Apex, etc.) by interpreting their playstyle, predicting their ideal League roles, and recommending champions and builds that match their existing strengths. Your output will feed directly into the personalization engine — do not include any extra text, formatting, or explanations. Only output a **valid JSON object** strictly matching the response schema.

---

## CONTEXT (for reasoning)
The system bridges games like **Fortnite**, **Valorant**, and **Apex Legends** into **League of Legends** by mapping player stats and inferred playstyle dimensions — aggression, teamplay, positioning, and clutch potential — into League equivalents.

- **Core Goal:** Translate multi-game behavior into actionable League insights.
- **Personality vectors:** aggression (duelist energy), positioning (map awareness, risk management), teamplay (supportiveness, coordination), utility (objective, vision, setup value), clutch (1vX performance, pressure handling).
- **Game translation logic examples:**
  - Fortnite “Fragger” → Aggressive skirmisher, early power curve → champions like Yasuo, Talon, Tristana.
  - Valorant “Duelist” → Burst/trade focus, mechanical precision → Zed, Kai’Sa, Ahri.
  - Apex “Support” → Peeling, sustain → Soraka, Nami, Lulu.
  - CS:GO “IGL” → Macro, map control → Jungle or Support roles.
- **League newcomers** should receive beginner-friendly, forgiving picks with low punishment for errors.
- **Veterans (3+ years)** should receive mechanically demanding or high-skill ceiling champions matching their previous game intensity.

The JSON must describe **who the player likely is**, **how they’d perform**, **what champions fit them**, and **next actions** the system can take.

---

## RESPONSE SCHEMA
Your JSON **must** exactly match this schema and contain no other text.

{
  "suggested_agents_csv": "string (comma-separated champion names)",
  "suggested_agents": ["string", "..."],
  "primary_role": "Top | Jungle | Mid | ADC | Support | Flex | unknown",
  "secondary_role": "Top | Jungle | Mid | ADC | Support | Flex | none | unknown",
  "champion_shortlist": [
    {
      "name": "string",
      "why": "string (<=120 chars explaining why the champion fits)",
      "difficulty": "Low | Medium | High"
    }
  ],
  "synergy_profile": {
    "style_vector": {
      "aggression": 0,
      "positioning": 0,
      "teamplay": 0,
      "utility": 0,
      "clutch": 0
    },
    "derived_from": ["league", "fortnite", "valorant", "apex", "csgo", "dota2"]
  },
  "synergy_score": {
    "solo_queue_fit": 0,
    "premade_team_fit": 0
  },
  "starting_build_context": {
    "lane": "Top | Jungle | Mid | ADC | Support | unknown",
    "early_focus": "trading | wave_control | roaming | objective | scaling | vision | unknown"
  },
  "risk_flags": ["missing_accounts", "conflicting_signals", "low_experience", "none"],
  "next_actions": ["string (short imperative suggestions, e.g. 'Run AI sim for Mid-Jungle synergy')"],
  "confidence": 0,
  "rationale": ["string", "string"],
  "metadata": {
    "llm_version": "string",
    "generated_at": "ISO 8601 timestamp",
    "inputs_seen": ["keys that were present in the onboarding payload"]
  }
}

---

## SCORING AND RANKING RULES

### Champion Ranking Logic
1. Rank champions by **behavioral alignment** (how the player naturally plays) > **mechanical similarity** > **complexity tolerance**.
2. For new players (<2 years in League): prioritize **medium or low-difficulty champions** with clear roles and visible power curves (e.g., Garen, Ahri, Miss Fortune).
3. For veterans (3+ years): introduce **high agency champions** that reward mastery and precise mechanics (e.g., Yasuo, Lee Sin, Zed).
4. Weight **cross-game archetypes** (like “Fragger”, “Duelist”, “IGL”) by confidence level from the presence of matching games.
5. Include 3–5 champions total in `champion_shortlist`.
6. Assign `confidence` (0–100) based on data completeness and consistency across games.

### Synergy and Skill Calculation
- **Aggression:** kills per match, role archetype (Fragger/Duelist) → 70–90 for offensive players.
- **Positioning:** tactical games (CS:GO, Valorant) boost this; drop if heavy melee/close-range focus.
- **Teamplay:** higher if Support, IGL, or healer archetype across games.
- **Utility:** tactical roles, objective focus, or utility item usage increase this.
- **Clutch:** high if success in solo moments (top-fragger, ace potential, or carry metrics).

Scores and dashboards should be in [0–100]. Neutral baseline = 50.

---

## OUTPUT INSTRUCTIONS
- Output **only JSON** with no prose or markdown.
- Must fully comply with the schema.
- Use ISO timestamps in UTC.
- Do not hallucinate nonexistent accounts or data sources.
- The JSON must be self-contained and immediately usable by downstream functions for champion recommendations and synergy analysis.

---''' + f"""

## PLAYER DATA

### Skills Affinity
{json.dumps(skills)}

### Experience Data
{json.dumps(onboarding_data)}

You will now output this object after reasoning internally. Do **not** include explanations or steps.
    """

    response = bedrock.invoke_model(
        modelId="amazon.nova-micro-v1:0",
        contentType="application/json",
        accept="application/json",
        body=json.dumps({
            "messages": [{
                "role": "user", 
                "content": [{"text": prompt}]
            }],
            "inferenceConfig": {
                "maxTokens": 500,
                "temperature": 0.7
            }
        })
    )

    result = json.loads(response["body"].read())
    return result["output"]["message"]["content"][0]["text"]

def synergy(squad):
    prompt = '''You are an expert game data and player-behavior analyst. Your job is to take structured player skills data and generate a JSON profile that powers our app’s League of Legends sqauds synergy prediction experience.

This app helps players synergize in League by interpreting their playstyle and recommending roles that match their existing strengths. Your output will feed directly into the personalization engine — do not include any extra text, formatting, or explanations. Only output a **valid JSON object** strictly matching the response schema.

You must calculate and build the optimal squad composition given each player's skillset. You must also provide a score for how well the squad performs together as a whole. 

**Each role—Top Lane, Jungle, Mid Lane, Bot Lane (ADC), or Support—can only be assigned to one player.**
**IGNORE the recommended primary or secondary role field of the players, your role is to see how the players play TOGETHER, not alone.**

---

## RESPONSE SCHEMA
Your JSON **must** exactly match this schema and contain no other text.

{
  "players": {
    "player_1_email": {"role": "string (League of Legends role: Top Lane, Jungle, Mid Lane, Bot Lane (ADC), and Support.)", "reasoning": "string"},
    "player_2_email": {"role": "string (League of Legends role: Top Lane, Jungle, Mid Lane, Bot Lane (ADC), and Support.)", "reasoning": "string"},
    ...
  },
  "overall_synergy_score": 0,
  "confidence": 0,
  "rationale": ["string", "string"],
  "metadata": {
    "llm_version": "string",
    "generated_at": "ISO 8601 timestamp",
  }
}

Scores should be in [0–100]. Neutral baseline = 50.

---

## SCORING AND RANKING RULES
- **Role Assignment**: Determine which player best matches which role. Each role can ONLY BE ASSIGNED TO ONE PLAYER.
- **Overall Synergy Score**: Calculate a combined score for the entire squad noting not only the strengths and weakness of individual players but how they compliment each other. For example a sqaud with very similar stats all biased towards one skill will not be a good fit for each other.
- **Player Role Assignment**: Assign roles based on the highest scoring combination of players within each role category.
- **Role Confidence**: Provide a confidence score for each role assignment indicating the certainty of the recommendation.
- **Rationale**: Explain your decision-making process for assigning roles and calculating overall synergy scores.

---

## OUTPUT INSTRUCTIONS
- Output **only JSON** with no prose or markdown.
- Must fully comply with the schema.
- Use ISO timestamps in UTC.
- Do not hallucinate nonexistent accounts or data sources.
- The JSON must be self-contained and immediately usable by downstream functions for champion recommendations and synergy analysis.

---''' + f"""

## SQUAD MEMBERS

{json.dumps(squad)}

You will now output this object after reasoning internally. Do **not** include explanations or steps.
    """

    response = bedrock.invoke_model(
        modelId="amazon.nova-micro-v1:0",
        contentType="application/json",
        accept="application/json",
        body=json.dumps({
            "messages": [{
                "role": "user", 
                "content": [{"text": prompt}]
            }],
            "inferenceConfig": {
                "maxTokens": 500,
                "temperature": 0.7
            }
        })
    )

    result = json.loads(response["body"].read())
    return result["output"]["message"]["content"][0]["text"]