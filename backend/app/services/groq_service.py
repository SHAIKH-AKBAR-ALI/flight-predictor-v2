import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _client


def explain(feature_importance: dict[str, float], predicted_price: float) -> str:
    top = sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:3]

    factor_lines = "\n".join(
        f"- {name.replace('_', ' ').title()}: "
        f"{'increases' if val > 0 else 'decreases'} price by ₹{abs(val):,.0f}"
        for name, val in top
    )

    prompt = (
        f"A flight price prediction model estimated this ticket will cost ₹{predicted_price:,.0f}.\n"
        f"The top 3 factors that shaped this price are:\n{factor_lines}\n\n"
        "In 2-3 plain English sentences, explain to a traveller why this flight "
        "costs what it does based on these factors. Be specific and avoid jargon."
    )

    response = _get_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=160,
        temperature=0.4,
    )
    return response.choices[0].message.content.strip()
