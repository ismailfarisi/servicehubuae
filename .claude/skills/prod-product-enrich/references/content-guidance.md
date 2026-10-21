# Writing the content: Arabic, English copy, and attribute choices

This is customer-facing marketplace copy for the UAE. It ships to prod without
a human rewriting it, so the bar is "a merchandiser would sign this off", not
"it's grammatical".

## The hard constraint: don't invent facts

Everything you write has to be derivable from what the audit gave you — the
product name, existing English copy, brand, category, and image alt text.

Beauty and fragrance products carry regulatory and trust risk that generic
e-commerce copy does not:

- **Never fabricate an ingredient list.** If `ingredients` is empty in the
  source, leave it empty in both languages. An invented INCI list is a
  compliance problem, not a copy problem.
- **Never invent claims** — "dermatologist tested", "clinically proven",
  "SPF 50", "suitable for sensitive skin", "halal certified", "cruelty-free",
  "paraben-free". These are legal assertions. Only restate a claim that is
  already present in the source text.
- **Never guess a concentration, volume, or shade** that isn't in the source.
- **Don't invent country of origin or certifications.**

When you can't fill a field honestly, leave it out of the plan and note it in
the `needs_human` list. A gap that stays a gap is a fine outcome; a confident
fabrication in prod is not.

## Arabic translation

Target reader: a Gulf/UAE shopper. Modern Standard Arabic with everyday retail
vocabulary — not Egyptian or Levantine colloquial, not stiff literary Arabic.

**Names go fully into Arabic script, brand included.** This is MyPickUAE's
decision (2026-07-28) and it overrides the more common UAE retail habit of
leaving Latin brand marks inline. So:

```
معطر منزلي بالعيدان تشيريزيا من تياترو 3000 مل
```

The shape is `[product form] [line name] من [brand] [size]`.

How to render a name depends on what kind of name it is:

- **Invented or foreign proper names → transliterate.** Teatro → تياترو,
  Ceresia → تشيريزيا, Diamante → ديامانتي.
- **Plain descriptive names → translate.** "Fig Leaves" is أوراق التين, not
  فيغ ليفز. A transliterated common noun reads as nonsense to a shopper.
- **Names already rooted in Arabic → use the Arabic word.** "Imperial Oud"
  becomes عود إمبريال, never a transliteration of the English of an Arabic word.

**Know what this does and doesn't buy you.** Product-name translations are
**not** in the Typesense index — `typesense.collection.ts` indexes
`name: product.name` (the English column) and `query_by` is
`name,description,tags,category_name,brand_name`. So Arabic names change what
renders on the storefront but do **not** become searchable; an Arabic query
still matches against English text. That's an indexing change, not a content
one — don't promise Arabic search as an outcome of this backfill.

Other conventions:

- Right-to-left punctuation: Arabic comma `،` and Arabic question mark `؟`.
- Keep Latin numerals (`50 مل`) — that's what UAE retail uses.
- Units: `مل` (ml), `جم` (g), `قطعة` (piece).
- Don't translate ingredient INCI names into Arabic; keep them as-is. Arabic
  `ingredients` should mirror the English list verbatim unless the English
  itself is prose.
- `meta_title` ≤ 60 chars, `meta_description` ≤ 155 chars — same as English.
  The DB caps them at 255 / 500 but search engines truncate far earlier.
- Translate meaning, not word order. A literal render of English marketing copy
  reads badly in Arabic; rewrite the sentence.

Quick sanity check on your own output: if the Arabic name is just the English
name in Arabic letters, or if it contains no Arabic script at all, it's wrong.

## English copy (only where empty)

- `short_description`: one sentence, ~120 chars, what it is and who it's for.
- `description`: 2–4 short paragraphs or a short intro plus bullets. Restate
  only what the source supports; expand on category-typical usage, not on
  invented properties.
- `usage_instructions`: only if the category makes it obvious and safe
  (e.g. "apply to pulse points" for an EDP). Otherwise leave empty.
- `meta_title`: `<Brand> <Product> | <Category>` shape, ≤ 60 chars.
- `meta_description`: ≤ 155 chars, includes the brand and one concrete detail.
- `tags`: 4–8 lowercase tags. Draw from brand, category, product type,
  fragrance family or skin concern *if stated*, and gifting occasion. No
  invented attributes, no single-use tags, no duplicates of the brand name in
  three forms.

## Attribute mapping

For each entry in `gaps.missing_attributes` you get `type`, `is_required`, and
`allowed_values` with real UUIDs.

- `select` / `color` / `multi_select` → pick an id from `allowed_values`.
  Match on meaning, not string similarity: "Eau de Parfum" in the product name
  maps to the `Eau de Parfum` option even if the option label is `EDP`.
- `text` / `number` / `date` / `boolean` → write `text_value` as a string.
- **Map only what the source supports.** If the product name and description
  give you no way to know the skin type, skip that attribute. A wrong facet
  value is worse than a missing one — it puts the product in filter results
  where it doesn't belong, and a customer who filters for "oily skin" and gets
  a product for dry skin loses trust in every filter on the site.
- Prioritise `is_required: true` attributes. Those are the ones the category
  was configured to filter on.
- Don't map variant axes (the audit already excludes them).

## Worked example

Source product: `Dior Sauvage Eau de Parfum 100ml`, brand `Dior`, category
`Men's Fragrance`, description empty, no attributes mapped. Category attributes
include `Fragrance Family` (select, required, allowed: Woody / Fresh / Oriental
/ Floral), `Concentration` (select, required, allowed: EDT / EDP / Parfum), and
`Skin Type` (select, not required).

Good plan entry:

```json
{
  "id": "…",
  "product": {
    "short_description": "A bold, fresh-woody eau de parfum for men, in a 100ml bottle.",
    "meta_title": "Dior Sauvage Eau de Parfum 100ml | Men's Fragrance",
    "tags": ["dior", "sauvage", "eau de parfum", "men's fragrance", "100ml"]
  },
  "translations_ar": {
    "name": "عطر او دو برفان سوفاج من ديور للرجال 100 مل",
    "short_description": "عطر رجالي بتركيبة خشبية منعشة، بحجم 100 مل.",
    "meta_title": "عطر سوفاج او دو برفان 100 مل من ديور | عطور رجالية"
  },
  "attributes": [
    { "attribute_id": "<Concentration id>", "value_id": "<EDP option id>" }
  ],
  "needs_human": ["Fragrance Family — 'Sauvage' does not state a family in the source", "ingredients — none recorded"]
}
```

Note what it did *not* do: no invented ingredient list, no `Skin Type` guess on
a fragrance, and `Fragrance Family` deferred to a human even though it's
required — because nothing in the source states it. Widely-known facts about a
famous product are still not facts *in this database*; someone with catalogue
authority should confirm them.
