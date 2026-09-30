import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExtractRequest {
  description: string;
}

function deterministicFallback(description: string) {
  const text = description.toLowerCase();
  const categories = [
    "backpack", "laptop", "phone", "wallet", "umbrella",
    "water bottle", "notebook", "headphones", "earbuds", "keys",
    "glasses", "watch", "jacket", "tablet", "camera", "calculator",
  "textbook", "id card", "charger",
  "electronics", "clothing", "accessory", "stationery",
  "bag", "bottle", "case", "device",
  "book", "card", "holder", "pouch", "container",
  "earphones", "headset", "speaker", "mouse", "keyboard", "drive",
    "ring", "necklace", "bracelet", "earring",
    "scarf", "glove", "hat", "cap", "shoe", "sneaker", "boot",
    "folder", "file", "document", "passport", "license",
    "mug", "flask", "thermos", "tumbler", "jug",
    "pencil", "pen", "marker", "eraser", "ruler", "scissors",
    "instrument", "tool", "kit", "set", "appliance",
    "game", "controller", "console", "cartridge", "disc",
    "frame", "poster", "painting", "art", "sculpture",
    "toy", "doll", "figure", "puzzle", "block",
    "food", "snack", "drink", "meal", "container",
    "medicine", "bottle", "pill", "kit", "supply",
    "cosmetic", "makeup", "lotion", "perfume", "brush",
    "sports", "ball", "racket", "bat", "glove",
    "music", "instrument", "guitar", "violin", "drum",
    "art", "supply", "canvas", "paint", "brush",
    "stationery", "supply", "stapler", "clip", "tape",
    "container", "box", "bin", "basket", "crate",
    "holder", "stand", "rack", "shelf", "organizer",
  ];
  const colors = [
    "black", "white", "blue", "red", "green", "yellow", "orange",
    "purple", "pink", "brown", "gray", "grey", "silver", "gold",
    "navy", "teal", "cyan", "maroon", "beige", "tan", "ivory",
    "charcoal", "olive", "coral", "turquoise", "lavender", "mint",
    "burgundy", "rust", "amber", "indigo", "violet", "magenta",
    "rose", "peach", "lime", "sky", "forest", "slate",
    "platinum", "bronze", "copper", "gunmetal",
    "midnight", "powder", "cream", "sand", "khaki",
    "denim", "mustard", "sage", "dusty",
    "crimson", "scarlet", "azure", "cobalt", "cerulean",
    "emerald", "jade", "mint", "sage", "olive",
    "amber", "honey", "caramel", "chocolate", "espresso",
    "ivory", "pearl", "snow", "ash", "smoke",
    "wine", "mulberry", "plum", "eggplant", "aubergine",
    "copper", "rose gold", "champagne", "blush",
    "midnight blue", "navy blue", "royal blue", "sky blue", "baby blue",
    "forest green", "lime green", "mint green", "olive green", "sage green",
    "hot pink", "baby pink", "rose pink", "salmon", "fuchsia",
    "light gray", "dark gray", "light grey", "dark grey",
    "off white", "warm white", "cool white",
    "metallic", "iridescent", "holographic", "gradient",
    "transparent", "translucent", "opaque",
    "matte", "glossy", "shiny", "metallic",
    "neon", "pastel", "vibrant", "muted", "earthy",
    "multi", "multicolored", "rainbow", "patterned", "printed",
    "striped", "spotted", "checkered", "floral", "geometric",
    "solid", "two-tone", "ombre", "faded", "worn",
  ];

  let foundCategory = "Other";
  for (const cat of categories) {
    if (text.includes(cat)) {
      foundCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
      break;
    }
  }

  let foundColor = "Unknown";
  for (const col of colors) {
    if (text.includes(col)) {
      foundColor = col.charAt(0).toUpperCase() + col.slice(1);
      break;
    }
  }

  const featureKeywords = [
    "sticker", "keychain", "scratch", "dent", "logo", "patch",
    "crack", "tag", "label", "mark", "stain", "tear", "rip",
    "engraving", "initials", "name", "serial", "strap", "handle",
    "zipper", "buckle", "clip", "charm", "ribbon", "badge",
    "pin", "button", "decal", "wrap", "cover", "case",
    "lanyard", "cord", "string", "chain", "ring", "hook",
    "pocket", "compartment", "pouch", "sleeve", "pocket",
    "wheel", "hinge", "lock", "key", "combination",
    "pattern", "design", "print", "graphic", "image", "photo",
    "picture", "art", "drawing", "painting", "sketch",
    "text", "writing", "note", "message", "label",
    "brand", "model", "type", "style", "version", "edition",
    "size", "shape", "material", "fabric", "leather", "metal",
    "plastic", "wood", "glass", "rubber", "silicone", "canvas",
    "denim", "cotton", "polyester", "nylon", "wool", "silk",
    "velvet", "suede", "mesh", "knit", "woven", "stitched",
    "embroidered", "printed", "painted", "stamped", "engraved",
    "embossed", "debossed", "woven", "printed", "stamped",
    "attached", "hanging", "visible", "hidden", "inside", "outside",
    "front", "back", "side", "top", "bottom", "left", "right",
    "corner", "edge", "center", "middle", "near", "around",
    "on the", "in the", "at the", "with a", "has a", "with an",
  ];

  const features: string[] = [];
  const sentences = description.split(/[.,;]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (
      lower.includes("has") ||
      lower.includes("with") ||
      lower.includes("there is") ||
      lower.includes("there are") ||
      lower.includes("attached") ||
      lower.includes("visible") ||
      lower.includes("sticker") ||
      lower.includes("keychain") ||
      lower.includes("scratch") ||
      lower.includes("dent") ||
      lower.includes("logo") ||
      lower.includes("patch") ||
      lower.includes("crack") ||
      lower.includes("tag") ||
      lower.includes("label") ||
      lower.includes("mark") ||
      lower.includes("stain") ||
      lower.includes("tear") ||
      lower.includes("rip") ||
      lower.includes("engraving") ||
      lower.includes("initials") ||
      lower.includes("name") ||
      lower.includes("serial") ||
      lower.includes("strap") ||
      lower.includes("handle") ||
      lower.includes("zipper") ||
      lower.includes("buckle") ||
      lower.includes("clip") ||
      lower.includes("charm") ||
      lower.includes("ribbon") ||
      lower.includes("badge") ||
      lower.includes("pin") ||
      lower.includes("button") ||
      lower.includes("decal") ||
      lower.includes("wrap") ||
      lower.includes("cover") ||
      lower.includes("case") ||
      lower.includes("lanyard") ||
      lower.includes("cord") ||
      lower.includes("string") ||
      lower.includes("chain") ||
      lower.includes("ring") ||
      lower.includes("hook") ||
      lower.includes("pocket") ||
      lower.includes("compartment") ||
      lower.includes("pouch") ||
      lower.includes("sleeve") ||
      lower.includes("wheel") ||
      lower.includes("hinge") ||
      lower.includes("lock") ||
      lower.includes("key") ||
      lower.includes("combination") ||
      lower.includes("pattern") ||
      lower.includes("design") ||
      lower.includes("print") ||
      lower.includes("graphic") ||
      lower.includes("image") ||
      lower.includes("photo") ||
      lower.includes("picture") ||
      lower.includes("art") ||
      lower.includes("drawing") ||
      lower.includes("painting") ||
      lower.includes("sketch") ||
      lower.includes("text") ||
      lower.includes("writing") ||
      lower.includes("note") ||
      lower.includes("message") ||
      lower.includes("brand") ||
      lower.includes("model") ||
      lower.includes("type") ||
      lower.includes("style") ||
      lower.includes("version") ||
      lower.includes("edition") ||
      lower.includes("size") ||
      lower.includes("shape") ||
      lower.includes("material") ||
      lower.includes("fabric") ||
      lower.includes("leather") ||
      lower.includes("metal") ||
      lower.includes("plastic") ||
      lower.includes("wood") ||
      lower.includes("glass") ||
      lower.includes("rubber") ||
      lower.includes("silicone") ||
      lower.includes("canvas") ||
      lower.includes("denim") ||
      lower.includes("cotton") ||
      lower.includes("polyester") ||
      lower.includes("nylon") ||
      lower.includes("wool") ||
      lower.includes("silk") ||
      lower.includes("velvet") ||
      lower.includes("suede") ||
      lower.includes("mesh") ||
      lower.includes("knit") ||
      lower.includes("woven") ||
      lower.includes("stitched") ||
      lower.includes("embroidered") ||
      lower.includes("printed") ||
      lower.includes("painted") ||
      lower.includes("stamped") ||
      lower.includes("engraved") ||
      lower.includes("embossed") ||
      lower.includes("debossed") ||
      lower.includes("attached") ||
      lower.includes("hanging") ||
      lower.includes("visible") ||
      lower.includes("hidden") ||
      lower.includes("inside") ||
      lower.includes("outside") ||
      lower.includes("front") ||
      lower.includes("back") ||
      lower.includes("side") ||
      lower.includes("top") ||
      lower.includes("bottom") ||
      lower.includes("left") ||
      lower.includes("right") ||
      lower.includes("corner") ||
      lower.includes("edge") ||
      lower.includes("center") ||
      lower.includes("middle") ||
      lower.includes("near") ||
      lower.includes("around") ||
      lower.includes("on the") ||
      lower.includes("in the") ||
      lower.includes("at the") ||
      lower.includes("with a") ||
      lower.includes("has a") ||
      lower.includes("with an")
    ) {
      const cleaned = sentence.trim().replace(/^(it has|has|with|there is|there are)\s*/i, "");
      if (cleaned.length > 3) {
        features.push(cleaned);
      }
    }
  }

  const uniqueFeatures = [...new Set(features)].slice(0, 5);

  return {
    category: foundCategory,
    color: foundColor,
    features: uniqueFeatures,
    source: "fallback",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { description } = await req.json() as ExtractRequest;

    if (!description || description.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: "Description is required (min 5 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (claudeKey) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": claudeKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 300,
            messages: [
              {
                role: "user",
                content: `Extract item attributes from this found-item description. Return ONLY valid JSON (no markdown, no explanation) with this exact format: {"category": "...", "color": "...", "features": ["...", "..."]}. Category should be a short noun (e.g., Backpack, Laptop, Wallet). Color should be a single color name. Features should be 2-5 short distinguishing characteristics.\n\nDescription: ${description}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.content?.[0]?.text || "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.category && parsed.color && Array.isArray(parsed.features)) {
              return new Response(
                JSON.stringify({
                  category: parsed.category,
                  color: parsed.color,
                  features: parsed.features.slice(0, 5),
                  source: "claude",
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        }
      } catch {
        // Fall through to deterministic fallback
      }
    }

    const fallback = deterministicFallback(description);
    return new Response(
      JSON.stringify(fallback),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
