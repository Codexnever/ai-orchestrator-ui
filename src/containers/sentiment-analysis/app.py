# containers/sentiment-analysis/app.py
import json
import pandas as pd
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from textblob import TextBlob
import nltk
import os

print("Starting sentiment analysis task...")

# Read input
with open('/app/input.json', 'r') as f:
    input_data = json.load(f)

# Extract text for analysis
request = input_data.get('rawRequest', '')
print(f"Processing request: {request}")

# If we have cleaned data from previous container, we'll use it
sample_data = input_data.get('sample_data', [])

# For demonstration, let's create some sample text data if we don't have prior data
if not sample_data:
    print("No prior data, creating sample text data")
    sample_texts = [
        "I absolutely love this product! It's amazing.",
        "The service was okay, but could be better.",
        "This is the worst experience I've ever had.",
        "The product is good quality and arrived on time.",
        "I'm not sure how I feel about this yet."
    ]
    sample_data = [{"text": text} for text in sample_texts]
else:
    # Add some sample text to the existing data
    for item in sample_data:
        item["text"] = f"Sample review for category {item.get('category', 'unknown')}"

print(f"Analyzing sentiment for {len(sample_data)} items")

# Initialize NLTK sentiment analyzer
sia = SentimentIntensityAnalyzer()

# Analyze sentiment for each text
results = []
for item in sample_data:
    text = item.get("text", "")
    
    # VADER sentiment analysis
    vader_scores = sia.polarity_scores(text)
    
    # TextBlob sentiment analysis
    blob = TextBlob(text)
    textblob_polarity = blob.sentiment.polarity
    textblob_subjectivity = blob.sentiment.subjectivity
    
    # Determine overall sentiment
    if vader_scores['compound'] >= 0.05:
        sentiment = "positive"
    elif vader_scores['compound'] <= -0.05:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    # Store results
    result = {
        **item,
        "sentiment": sentiment,
        "vader_scores": vader_scores,
        "textblob_polarity": textblob_polarity,
        "textblob_subjectivity": textblob_subjectivity
    }
    results.append(result)

# Calculate summary statistics
sentiment_counts = {
    "positive": sum(1 for r in results if r["sentiment"] == "positive"),
    "neutral": sum(1 for r in results if r["sentiment"] == "neutral"),
    "negative": sum(1 for r in results if r["sentiment"] == "negative")
}

avg_compound = sum(r["vader_scores"]["compound"] for r in results) / len(results)
avg_polarity = sum(r["textblob_polarity"] for r in results) / len(results)
avg_subjectivity = sum(r["textblob_subjectivity"] for r in results) / len(results)

# Create output
output = {
    "message": "Sentiment analysis completed successfully",
    "analyzed_items": len(results),
    "sentiment_distribution": sentiment_counts,
    "average_scores": {
        "compound": avg_compound,
        "polarity": avg_polarity,
        "subjectivity": avg_subjectivity
    },
    "results": results
}

# Write output
with open('/app/output.json', 'w') as f:
    json.dump(output, f)

print("Sentiment analysis task completed")