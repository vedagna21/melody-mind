import Sentiment from "sentiment";

const sentiment = new Sentiment();

export function detectMood(text) {
  const result = sentiment.analyze(text);

  if (result.score > 0) {
    return "Happy 😊";
  } else if (result.score < 0) {
    return "Sad 😢";
  } else {
    return "Neutral 😐";
  }
}
