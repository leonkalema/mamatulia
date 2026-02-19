# About Page - Contentful Setup

## Content Type: `aboutPage`

Create this content type in Contentful with the following fields:

### Required Fields

| Field ID | Field Name | Type | Required | Description |
|----------|------------|------|----------|-------------|
| `title` | Title | Short text | ✅ | Internal title (e.g., "About Us") |
| `heroTitle` | Hero Title | Short text | ✅ | Main headline in hero (e.g., "About Mama Tulia") |
| `heroSubtitle` | Hero Subtitle | Long text | ✅ | Subheadline in hero |
| `missionTitle` | Mission Section Title | Short text | ✅ | Title for mission section (e.g., "Why We Exist") |
| `missionBody` | Mission Body | Long text | ✅ | Mission content (use double line breaks for paragraphs) |
| `vision` | Vision Statement | Long text | ✅ | Vision quote |

### Optional Fields

| Field ID | Field Name | Type | Required | Description |
|----------|------------|------|----------|-------------|
| `heroImage` | Hero Image | Media (single) | ❌ | Background/decorative image |
| `missionImage` | Mission Image | Media (single) | ❌ | Image for mission section |
| `values` | Values | References (many) | ❌ | Link to `value` entries |
| `stats` | Stats | References (many) | ❌ | Link to `stat` entries |
| `teamMembers` | Team Members | References (many) | ❌ | Link to `teamMember` entries |
| `seoTitle` | SEO Title | Short text | ❌ | Custom SEO title |
| `seoDescription` | SEO Description | Long text | ❌ | Custom meta description |

---

## Supporting Content Types

### Content Type: `value`

| Field ID | Field Name | Type | Required |
|----------|------------|------|----------|
| `title` | Title | Short text | ✅ |
| `description` | Description | Long text | ✅ |

### Content Type: `stat`

| Field ID | Field Name | Type | Required |
|----------|------------|------|----------|
| `value` | Value | Short text | ✅ |
| `label` | Label | Short text | ✅ |
| `icon` | Icon | Short text | ❌ |

### Content Type: `teamMember`

| Field ID | Field Name | Type | Required |
|----------|------------|------|----------|
| `name` | Name | Short text | ✅ |
| `role` | Role | Short text | ✅ |
| `bio` | Bio | Long text | ❌ |
| `photo` | Photo | Media (single) | ❌ |

---

## Example Content

### About Page Entry

```
title: "About Us"
heroTitle: "About Mama Tulia"
heroSubtitle: "Walking alongside mothers of premature babies with hope, care, and community."
missionTitle: "Why We Exist"
missionBody: "Mama Tulia Ministries exists to support mothers of premature babies in Uganda through practical care, emotional support, and spiritual encouragement.

We believe every preemie deserves a fighting chance, and every mother deserves support during one of the most challenging seasons of her life.

Founded in 2015, we've grown from a small outreach to a comprehensive ministry serving thousands of families across Uganda. Our name 'Mama Tulia' means 'Mother, be calm' in Swahili — a reminder of the peace we seek to bring to anxious mothers."
vision: "A Uganda where no mother faces the journey of caring for a premature baby alone."
```

### Value Entries

1. **Compassion**: "We meet mothers where they are with empathy and understanding."
2. **Hope**: "We believe in the resilience of every baby and the strength of every mother."
3. **Community**: "We build networks of support that extend beyond our direct care."
4. **Faith**: "Our work is grounded in our faith and trust in God's provision."

### Stat Entries

1. **2015** - "Year Founded"
2. **Uganda** - "Based In"
3. **11,500+** - "Mothers Supported"
4. **1,600+** - "Preemie Kits Given"

---

## Steps to Create in Contentful

1. **Create `value` content type** with `title` and `description` fields
2. **Create `stat` content type** with `value`, `label`, and optional `icon` fields
3. **Create `teamMember` content type** (if not exists) with `name`, `role`, `bio`, `photo` fields
4. **Create `aboutPage` content type** with all fields listed above
5. **Create value entries** (4 values)
6. **Create stat entries** (4 stats)
7. **Create teamMember entries** (as needed)
8. **Create the About Page entry** and link all references

Once created, the About page at `/about` will display the content.
