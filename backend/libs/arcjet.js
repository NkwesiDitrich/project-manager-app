import arcjet, {
  detectBot,
  shield,
  tokenBucket,
  validateEmail,
} from "@arcjet/node";

const aj = process.env.ARCJET_KEY
  ? arcjet({
      key: process.env.ARCJET_KEY,
      characteristics: ["ip.src"],
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({
          mode: "LIVE",
          allow: ["CATEGORY:SEARCH_ENGINE"],
        }),
        validateEmail({
          mode: "LIVE",
          deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
        }),
        tokenBucket({
          mode: "LIVE",
          refillRate: 5,
          interval: 10,
          capacity: 10,
        }),
      ],
    })
  : {
      protect: () => Promise.resolve({ isDenied: () => false }),
    };

export default aj;
